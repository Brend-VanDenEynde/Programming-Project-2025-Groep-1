-- tabel van de user
CREATE TABLE IF NOT EXISTS gebruiker (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    wachtwoord TEXT NOT NULL,
    is_admin TINYINT NOT NULL DEFAULT 0,
    creared_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

-- tabel voor een bedrijf 
-- Deze tabel bevat de gegevens van bedrijven die zich hebben geregistreerd
CREATE TABLE IF NOT EXISTS bedrijf (
    gebruiker_id INTEGER PRIMARY KEY,
    FOREIGN KEY (gebruiker_id) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE,
    naam TEXT NOT NULL,
    plaats TEXT NOT NULL,
    contact_email TEXT NOT NULL UNIQUE,
    linkedin TEXT
);

-- Tabel voor de studenten
-- Deze tabel bevat de gegevens van studenten die zich hebben geregistreerd
CREATE TABLE IF NOT EXISTS student (
    gebruiker_id INTEGER PRIMARY KEY,
    FOREIGN KEY (gebruiker_id) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE,
    voornaam TEXT NOT NULL,
    achternaam TEXT NOT NULL,
    linkedin TEXT,
    profiel_foto TEXT,
    studiejaar INTEGER NOT NULL,
    opleiding_id INTEGER NOT NULL,
    FOREIGN KEY (opleiding_id) REFERENCES opleiding(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- Tabel voor de opleidingen die studenten kunnen volgen
-- Dit maakt het mogelijk om studenten te koppelen aan hun opleiding
CREATE TABLE IF NOT EXISTS opleiding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    naam TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('Bachelor', 'Graduaat', 'Master'))
);
-- Alvast enkele opleidingen toe te voegen
INSERT INTO opleiding (naam, type) VALUES ('Toegepaste Informatica', 'Bachelor');
INSERT INTO opleiding (naam, type) VALUES ('Programmeren', 'Graduaat');


-- Tabel voor de stands die bedrijven kunnen hebben
CREATE TABLE IF NOT EXISTS stand (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lokaal TEXT NOT NULL,
    id_bedrijf INTEGER NOT NULL,
    FOREIGN KEY (id_bedrijf) REFERENCES bedrijf(gebruiker_id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- Tabel voor de speeddate afspraken tussen studenten en bedrijven
-- Dit maakt het mogelijk om afspraken te plannen voor speeddate sessies
CREATE TABLE IF NOT EXISTS speeddate (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_student INTEGER NOT NULL,
    id_bedrijf INTEGER NOT NULL,
    datum DATETIME NOT NULL,
    akkoord TINYINT NOT NULL DEFAULT 0,
    FOREIGN KEY (id_student) REFERENCES student(gebruiker_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_bedrijf) REFERENCES bedrijf(gebruiker_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabel voor de final works die studenten aanbieden
-- Dit maakt het mogelijk om studenten hun final works te laten aanbieden
CREATE TABLE IF NOT EXISTS finalwork (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_student INTEGER NOT NULL,
    lokaal TEXT NOT NULL,
    FOREIGN KEY (id_student) REFERENCES student(gebruiker_id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- tabel voor de skills die bedrijven en studenten kunnen hebben
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill TEXT NOT NULL UNIQUE
);

-- Skills kunnen worden toegevoegd aan de aan bedrijven en studenten
-- zo kunnen bedrijven hun vereiste skills aangeven en studenten hun vaardigheden tonen
CREATE TABLE IF NOT EXISTS gebruiker_skills (
    id_gebruiker INTEGER NOT NULL,
    id_skill INTEGER NOT NULL,
    FOREIGN KEY (id_gebruiker) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_skill) REFERENCES skills(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (id_gebruiker, id_skill)
);


-- functie bevat de verschillende functies die een student kan zoeken en een bedrijf kan aanbieden
CREATE TABLE IF NOT EXISTS functie (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    naam TEXT NOT NULL UNIQUE
);
-- Voorbeelden van functies
INSERT INTO functie (naam) VALUES ('Parttime');
INSERT INTO functie (naam) VALUES ('Fulltime');
INSERT INTO functie (naam) VALUES ('Stage');

-- Tabel voor de relatie tussen bedrijven en functies
-- Dit maakt het mogelijk om meerdere functies aan een bedrijf te koppelen
CREATE TABLE IF NOT EXISTS bedrijf_functie (
    id_bedrijf INTEGER NOT NULL,
    id_functie INTEGER NOT NULL,
    FOREIGN KEY (id_bedrijf) REFERENCES bedrijf(gebruiker_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_functie) REFERENCES functie(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (id_bedrijf, id_functie)
);

-- contactformulier
-- Deze tabel slaat de berichten op die studenten of bedrijven  kunnen sturen via het contactformulier zodat een admin deze kan bekijken
CREATE TABLE IF NOT EXISTS contact (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gebruiker_id INTEGER NOT NULL,
    onderwerp TEXT NOT NULL,   
    bericht TEXT NOT NULL,
    FOREIGN KEY (gebruiker_id) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- Tabel voor de relatie tussen bedrijven en opleidingen
-- Dit maakt het mogelijk om meerdere opleidingen aan een bedrijf te koppelen
CREATE TABLE IF NOT EXISTS bedrijf_opleiding (
    id_bedrijf INTEGER NOT NULL,
    id_opleiding INTEGER NOT NULL,
    PRIMARY KEY (id_bedrijf, id_opleiding),
    FOREIGN KEY (id_bedrijf) REFERENCES bedrijf(gebruiker_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_opleiding) REFERENCES opleiding(id) ON DELETE CASCADE ON UPDATE CASCADE
);
