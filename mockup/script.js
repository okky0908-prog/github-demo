(() => {
  "use strict";

  const PRIORITY_LABEL = { high: "高", mid: "中", low: "低" };

  function createId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  /** @type {{id:string,title:string,cards:{id:string,title:string,description:string,priority:string,dueDate:string}[]}[]} */
  let lists = [
    {
      id: createId(),
      title: "未着手",
      cards: [
        { id: createId(), title: "要件定義書のレビュー", description: "誤字脱字・抜け漏れがないか最終確認する", priority: "high", dueDate: todayPlus(1) },
        { id: createId(), title: "画面モックのフィードバック依頼", description: "", priority: "mid", dueDate: "" },
      ],
    },
    {
      id: createId(),
      title: "進行中",
      cards: [
        { id: createId(), title: "ボード画面のレイアウト実装", description: "リストを横並びで表示するCSSを作成する", priority: "high", dueDate: todayPlus(3) },
        { id: createId(), title: "カード編集モーダルの実装", description: "", priority: "low", dueDate: "" },
        { id: createId(), title: "ドラッグ&ドロップの動作確認", description: "リスト間移動と同一リスト内並び替えの両方を確認", priority: "mid", dueDate: todayPlus(5) },
      ],
    },
    {
      id: createId(),
      title: "完了",
      cards: [
        { id: createId(), title: "要件定義書の作成", description: "", priority: "", dueDate: "" },
        { id: createId(), title: "ドキュメントの分割", description: "機能要件・画面仕様・ER図等を個別ドキュメント化", priority: "low", dueDate: "" },
      ],
    },
  ];

  function todayPlus(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function findCardById(cardId) {
    for (const list of lists) {
      const card = list.cards.find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  }

  // ---- UI state (does not require full re-render of unrelated parts) ----
  let quickAddOpenListId = null;
  let openMenuEl = null;
  let editingCard = null; // { listId, cardId }

  const boardEl = document.getElementById("board");
  const overlayEl = document.getElementById("modal-overlay");
  const titleInput = document.getElementById("card-title-input");
  const descriptionInput = document.getElementById("card-description-input");
  const priorityInput = document.getElementById("card-priority-input");
  const dueDateInput = document.getElementById("card-due-date-input");

  // ---------------------------------------------------------------------
  // 描画
  // ---------------------------------------------------------------------

  function render() {
    boardEl.innerHTML = "";
    lists.forEach((list) => boardEl.appendChild(renderList(list)));
    boardEl.appendChild(renderAddListColumn());
  }

  function renderList(list) {
    const listEl = document.createElement("section");
    listEl.className = "list";
    listEl.dataset.listId = list.id;

    const header = document.createElement("div");
    header.className = "list-header";

    const titleSpan = document.createElement("div");
    titleSpan.className = "list-title";
    titleSpan.textContent = list.title;
    titleSpan.title = "クリックしてリスト名を編集";
    titleSpan.addEventListener("click", () => startEditListTitle(listEl, list));
    header.appendChild(titleSpan);

    const menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "list-menu-btn";
    menuBtn.textContent = "…";
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openListMenu(list, menuBtn);
    });
    header.appendChild(menuBtn);

    listEl.appendChild(header);

    const cardListEl = document.createElement("div");
    cardListEl.className = "card-list";
    list.cards.forEach((card) => cardListEl.appendChild(renderCard(card, list)));
    listEl.appendChild(cardListEl);

    attachDropZone(listEl, cardListEl);

    if (quickAddOpenListId === list.id) {
      listEl.appendChild(renderQuickAddForm(list));
    } else {
      const addCardBtn = document.createElement("button");
      addCardBtn.type = "button";
      addCardBtn.className = "add-card-btn";
      addCardBtn.textContent = "＋ カードを追加";
      addCardBtn.addEventListener("click", () => {
        quickAddOpenListId = list.id;
        render();
      });
      listEl.appendChild(addCardBtn);
    }

    return listEl;
  }

  function renderCard(card, list) {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.dataset.cardId = card.id;
    cardEl.draggable = true;

    if (card.priority) {
      const badges = document.createElement("div");
      badges.className = "card-badges";
      const badge = document.createElement("span");
      badge.className = "priority-badge priority-" + card.priority;
      badge.textContent = PRIORITY_LABEL[card.priority] || card.priority;
      badges.appendChild(badge);
      cardEl.appendChild(badges);
    }

    const titleEl = document.createElement("div");
    titleEl.className = "card-title";
    titleEl.textContent = card.title;
    cardEl.appendChild(titleEl);

    if (card.dueDate) {
      const dueEl = document.createElement("div");
      dueEl.className = "card-due-date";
      dueEl.textContent = "期限：" + formatDate(card.dueDate);
      cardEl.appendChild(dueEl);
    }

    cardEl.addEventListener("click", () => openCardModal(list.id, card.id));

    cardEl.addEventListener("dragstart", (e) => {
      cardEl.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", card.id);
    });
    cardEl.addEventListener("dragend", () => {
      cardEl.classList.remove("dragging");
      document.querySelectorAll(".list.drag-over").forEach((el) => el.classList.remove("drag-over"));
    });

    return cardEl;
  }

  function renderQuickAddForm(list) {
    const wrapper = document.createElement("div");
    wrapper.className = "quick-add-form";

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 200;
    input.placeholder = "カードのタイトルを入力";

    const actions = document.createElement("div");
    actions.className = "quick-add-actions";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-primary";
    addBtn.textContent = "追加";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn-link";
    cancelBtn.textContent = "キャンセル";

    function confirmAdd() {
      const title = input.value.trim();
      if (!title) {
        input.focus();
        return;
      }
      list.cards.push({ id: createId(), title, description: "", priority: "", dueDate: "" });
      render();
    }

    addBtn.addEventListener("click", confirmAdd);
    cancelBtn.addEventListener("click", () => {
      quickAddOpenListId = null;
      render();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmAdd();
      } else if (e.key === "Escape") {
        quickAddOpenListId = null;
        render();
      }
    });

    actions.appendChild(addBtn);
    actions.appendChild(cancelBtn);
    wrapper.appendChild(input);
    wrapper.appendChild(actions);

    setTimeout(() => input.focus(), 0);
    return wrapper;
  }

  function renderAddListColumn() {
    const wrapper = document.createElement("div");
    wrapper.className = "add-list-column";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "add-list-btn";
    btn.textContent = "＋ リストを追加";
    btn.addEventListener("click", () => {
      wrapper.innerHTML = "";
      wrapper.appendChild(renderAddListForm());
    });

    wrapper.appendChild(btn);
    return wrapper;
  }

  function renderAddListForm() {
    const form = document.createElement("div");
    form.className = "quick-add-form";

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 100;
    input.placeholder = "リスト名を入力";

    const actions = document.createElement("div");
    actions.className = "quick-add-actions";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-primary";
    addBtn.textContent = "リストを追加";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn-link";
    cancelBtn.textContent = "キャンセル";

    function confirmAdd() {
      const title = input.value.trim();
      if (!title) {
        input.focus();
        return;
      }
      lists.push({ id: createId(), title, cards: [] });
      render();
    }

    addBtn.addEventListener("click", confirmAdd);
    cancelBtn.addEventListener("click", render);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        confirmAdd();
      } else if (e.key === "Escape") {
        render();
      }
    });

    actions.appendChild(addBtn);
    actions.appendChild(cancelBtn);
    form.appendChild(input);
    form.appendChild(actions);

    setTimeout(() => input.focus(), 0);
    return form;
  }

  // ---------------------------------------------------------------------
  // リスト名インライン編集
  // ---------------------------------------------------------------------

  function startEditListTitle(listEl, list) {
    const header = listEl.querySelector(".list-header");
    const titleSpan = header.querySelector(".list-title");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "list-title-input";
    input.maxLength = 100;
    input.value = list.title;

    function confirmEdit() {
      const value = input.value.trim();
      if (value) list.title = value;
      render();
    }

    input.addEventListener("blur", confirmEdit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      } else if (e.key === "Escape") {
        input.removeEventListener("blur", confirmEdit);
        render();
      }
    });

    header.replaceChild(input, titleSpan);
    input.focus();
    input.select();
  }

  // ---------------------------------------------------------------------
  // リストメニュー（削除）
  // ---------------------------------------------------------------------

  function closeListMenu() {
    if (openMenuEl) {
      openMenuEl.remove();
      openMenuEl = null;
      document.removeEventListener("click", handleOutsideMenuClick);
    }
  }

  function handleOutsideMenuClick(e) {
    if (openMenuEl && !openMenuEl.contains(e.target)) closeListMenu();
  }

  function openListMenu(list, anchorBtn) {
    closeListMenu();

    const menu = document.createElement("div");
    menu.className = "list-menu";

    const deleteItem = document.createElement("button");
    deleteItem.type = "button";
    deleteItem.className = "list-menu-item";
    deleteItem.textContent = "リストを削除";
    deleteItem.addEventListener("click", () => {
      closeListMenu();
      const count = list.cards.length;
      const message =
        count > 0
          ? `リスト「${list.title}」を削除しますか？\n内包する${count}件のカードも削除されます。`
          : `リスト「${list.title}」を削除しますか？`;
      if (confirm(message)) {
        lists = lists.filter((l) => l.id !== list.id);
        render();
      }
    });
    menu.appendChild(deleteItem);

    document.body.appendChild(menu);
    const rect = anchorBtn.getBoundingClientRect();
    menu.style.top = rect.bottom + window.scrollY + 4 + "px";
    menu.style.left = rect.right + window.scrollX - menu.offsetWidth + "px";
    openMenuEl = menu;

    setTimeout(() => document.addEventListener("click", handleOutsideMenuClick), 0);
  }

  // ---------------------------------------------------------------------
  // カード編集モーダル
  // ---------------------------------------------------------------------

  function openCardModal(listId, cardId) {
    const card = findCardById(cardId);
    if (!card) return;
    editingCard = { listId, cardId };

    titleInput.value = card.title;
    descriptionInput.value = card.description || "";
    priorityInput.value = card.priority || "";
    dueDateInput.value = card.dueDate || "";

    overlayEl.classList.remove("hidden");
    titleInput.focus();
  }

  function closeCardModal() {
    editingCard = null;
    overlayEl.classList.add("hidden");
  }

  function saveCardModal() {
    if (!editingCard) return;
    const title = titleInput.value.trim();
    if (!title) {
      titleInput.focus();
      return;
    }
    const card = findCardById(editingCard.cardId);
    if (!card) return;
    card.title = title;
    card.description = descriptionInput.value.trim();
    card.priority = priorityInput.value;
    card.dueDate = dueDateInput.value;
    closeCardModal();
    render();
  }

  function deleteCardModal() {
    if (!editingCard) return;
    const card = findCardById(editingCard.cardId);
    if (!card) return;
    if (!confirm(`カード「${card.title}」を削除しますか？`)) return;
    const list = lists.find((l) => l.id === editingCard.listId);
    if (list) list.cards = list.cards.filter((c) => c.id !== card.id);
    closeCardModal();
    render();
  }

  document.getElementById("card-save-btn").addEventListener("click", saveCardModal);
  document.getElementById("card-cancel-btn").addEventListener("click", closeCardModal);
  document.getElementById("card-delete-btn").addEventListener("click", deleteCardModal);
  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeCardModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlayEl.classList.contains("hidden")) closeCardModal();
  });

  // ---------------------------------------------------------------------
  // ドラッグ&ドロップ
  // ---------------------------------------------------------------------

  function getDragAfterElement(container, y) {
    const cards = [...container.querySelectorAll(".card:not(.dragging)")];
    return cards.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  function attachDropZone(listEl, cardListEl) {
    listEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggingEl = document.querySelector(".card.dragging");
      if (!draggingEl) return;
      listEl.classList.add("drag-over");
      const afterElement = getDragAfterElement(cardListEl, e.clientY);
      if (afterElement == null) {
        cardListEl.appendChild(draggingEl);
      } else {
        cardListEl.insertBefore(draggingEl, afterElement);
      }
    });

    listEl.addEventListener("dragleave", (e) => {
      if (!listEl.contains(e.relatedTarget)) listEl.classList.remove("drag-over");
    });

    listEl.addEventListener("drop", (e) => {
      e.preventDefault();
      listEl.classList.remove("drag-over");
      syncListsFromDom();
      render();
    });
  }

  function syncListsFromDom() {
    const newLists = [...boardEl.querySelectorAll(".list")].map((listEl) => {
      const listId = listEl.dataset.listId;
      const oldList = lists.find((l) => l.id === listId);
      const cardIds = [...listEl.querySelectorAll(".card")].map((c) => c.dataset.cardId);
      const cards = cardIds.map((id) => findCardById(id)).filter(Boolean);
      return { ...oldList, cards };
    });
    lists = newLists;
  }

  // ---------------------------------------------------------------------
  // ユーティリティ
  // ---------------------------------------------------------------------

  function formatDate(isoDate) {
    const [y, m, d] = isoDate.split("-");
    return `${y}/${m}/${d}`;
  }

  render();
})();
