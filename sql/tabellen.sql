CREATE TABLE IF NOT EXISTS rollen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL
);

INSERT INTO rollen (role) VALUES 
    ('admin'),
    ('bedrijf'),
    ('student');
    
CREATE TABLE IF NOT EXISTS gebruiker (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    wachtwoord TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    voornaam TEXT,
    achternaam TEXT,
    linkedin TEXT,
    profiel_foto TEXT,
    opleiding TEXT,
    opleidingsjaar TEXT,
    positie TEXT,
    skills TEXT,
    contactemail TEXT,
    plaats TEXT,
    goedkeuring TINYINT NOT NULL DEFAULT 0,
    FOREIGN KEY (role_id) REFERENCES rollen(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS stand (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lokaal TEXT NOT NULL,
    id_gebruiker INTEGER NOT NULL,
    FOREIGN KEY (id_gebruiker) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Speeddate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_student INTEGER NOT NULL,
    id_bedrijf INTEGER NOT NULL,
    datum DATETIME NOT NULL,
    akkoord TINYINT NOT NULL DEFAULT 0,
    FOREIGN KEY (id_student) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_bedrijf) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS finalwork (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_student INTEGER NOT NULL,
    lokaal TEXT NOT NULL,
    FOREIGN KEY (id_student) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE
);
