CREATE TABLE people (
    id INT not null,
    name VARCHAR(30) NOT NULL,
    age INT NOT NULL,
    city VARCHAR(50) NOT NULL
);

CREATE INDEX idx_idt1 ON people(id);

CREATE TABLE investors (
    id INT not null,
    name VARCHAR(30) NOT NULL,
    money_invested NUMERIC NOT NULL,
    money_earned NUMERIC NOT NULL,
    city VARCHAR(50) NOT NULL
);

CREATE INDEX idx_idt2 ON investors(id);

/*ALMACENADA EN ELEPHANTSQL*/