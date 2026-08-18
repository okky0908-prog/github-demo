CREATE TABLE board (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE list (
    id UUID PRIMARY KEY,
    board_id UUID NOT NULL REFERENCES board (id),
    title VARCHAR(255) NOT NULL,
    position INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_list_board_id ON list (board_id);

CREATE TABLE card (
    id UUID PRIMARY KEY,
    list_id UUID NOT NULL REFERENCES list (id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10),
    due_date DATE,
    position INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_card_list_id ON card (list_id);
