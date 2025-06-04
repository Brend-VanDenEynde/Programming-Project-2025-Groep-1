CREATE table if not exists 'rollen'(
    id integer primary key autoincrement,
    role text not null
)

insert into rollen (role) values ('admin');
insert into rollen (role) values ('bedrijf');
insert into rollen (role) values ('student');


CREATE table if not exists 'gebruiker'(
    id integer primary key autoincrement,
    email text not null unique,
    wachtwoord text not null,
    role_id integer not null,
    voornaam text,
    achternaam text,
    linked_in text,
    profiel_foto text,
    opleiding text,
    opleidingsjaar text,
    positie text,
    skills text,
    contactemail text,
    plaats text,
    goedkeuring tinyint not null default 0,
    FOREIGN KEY (role_id) REFERENCES rollen(id) ON DELETE CASCADE ON UPDATE CASCADE
) 

CREATE table if not exists 'stand'(
    id integer primary key autoincrement,
    lokaal text not null,
    id_gebruiker integer not null,
    FOREIGN KEY (id_gebruiker) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE table if not exists 'Speeddate'(
    id integer primary key autoincrement,
    id_student integer not null,
    id_bedrijf integer not null,
    datum datetime not null,
    akkoord tinyint not null default 0,
    FOREIGN KEY (id_student) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_bedrijf) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE
)

CREATE table if not exists 'finalwork'(
    id integer primary key autoincrement,
    id_student integer not null,
    lokaal text not null,
    FOREIGN KEY (id_student) REFERENCES gebruiker(id) ON DELETE CASCADE ON UPDATE CASCADE
)