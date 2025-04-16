DROP TABLE IF EXISTS Epingle CASCADE;
DROP TABLE IF EXISTS Est_affecte CASCADE;
DROP TABLE IF EXISTS Note CASCADE;
DROP TABLE IF EXISTS Possede CASCADE;
DROP TABLE IF EXISTS Notification CASCADE;
DROP TABLE IF EXISTS Publication CASCADE;
DROP TABLE IF EXISTS Section CASCADE;
DROP TABLE IF EXISTS Priorite CASCADE;
DROP TABLE IF EXISTS Controle CASCADE;
DROP TABLE IF EXISTS Type_notification CASCADE;
DROP TABLE IF EXISTS Type_publication CASCADE;
DROP TABLE IF EXISTS UE CASCADE;
DROP TABLE IF EXISTS Role CASCADE;
DROP TABLE IF EXISTS Utilisateur CASCADE;

CREATE TABLE Utilisateur
(
    id_utilisateur    SERIAL PRIMARY KEY,
    nom               VARCHAR(100) NOT NULL,
    prenom            VARCHAR(100) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    mot_de_passe      VARCHAR(255) NOT NULL,
    telephone         VARCHAR(50),
    date_creation     TIMESTAMP NOT NULL,
    date_modification TIMESTAMP,
    image             VARCHAR(255) NOT NULL
);

CREATE TABLE Role
(
    id_role SERIAL PRIMARY KEY,
    nom     VARCHAR(100) NOT NULL
);

CREATE TABLE UE
(
    code        VARCHAR(50) PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    semestre    VARCHAR(50) NOT NULL,
    image       VARCHAR(255) NOT NULL
);

CREATE TABLE Type_publication
(
    id_type_publication SERIAL PRIMARY KEY,
    nom                 VARCHAR(50) NOT NULL
);

CREATE TABLE Type_notification
(
    id_type_notification SERIAL PRIMARY KEY,
    nom                  VARCHAR(50) NOT NULL
);

CREATE TABLE Controle
(
    id_controle SERIAL PRIMARY KEY,
    nom         VARCHAR(50) NOT NULL,
    code        VARCHAR(50),
    FOREIGN KEY (code) REFERENCES UE (code)
);

CREATE TABLE Priorite
(
    id_priorite SERIAL PRIMARY KEY,
    nom         VARCHAR(50) NOT NULL
);

CREATE TABLE Section
(
    id_section SERIAL PRIMARY KEY,
    nom        VARCHAR(50) NOT NULL,
    code       VARCHAR(50),
    FOREIGN KEY (code) REFERENCES UE (code)
);

CREATE TABLE Publication
(
    id_publication      SERIAL PRIMARY KEY,
    titre               VARCHAR(50) NOT NULL,
    description         VARCHAR(50),
    contenu             VARCHAR(50) NOT NULL,
    derniere_modif      TIMESTAMP,
    ordre               INT,
    visible             BOOLEAN,
    section_id          INT,
    utilisateur_id      INT,
    type_publication_id INT,
    code                VARCHAR(50),
    FOREIGN KEY (section_id) REFERENCES Section (id_section),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (type_publication_id) REFERENCES Type_publication (id_type_publication),
    FOREIGN KEY (code) REFERENCES UE (code)
);

CREATE TABLE Notification
(
    id_notification             SERIAL PRIMARY KEY,
    contenu                     VARCHAR(255) NOT NULL,
    date_notif                  TIMESTAMP NOT NULL,
    url_destination             VARCHAR(255) NOT NULL,
    type_notification_id        INT,
    utilisateur_expediteur_id   INT NOT NULL,
    utilisateur_destinataire_id INT NOT NULL,
    code                        VARCHAR(50) NOT NULL,
    priorite_id                 INT,
    FOREIGN KEY (type_notification_id) REFERENCES Type_notification (id_type_notification),
    FOREIGN KEY (utilisateur_expediteur_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (utilisateur_destinataire_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (code) REFERENCES UE (code),
    FOREIGN KEY (priorite_id) REFERENCES Priorite (id_priorite)
);

CREATE TABLE Possede
(
    utilisateur_id INT,
    role_id        INT,
    PRIMARY KEY (utilisateur_id, role_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (role_id) REFERENCES Role (id_role)
);

CREATE TABLE Note
(
    utilisateur_id INT,
    controle_id    INT,
    resultat       INT NOT NULL,
    PRIMARY KEY (utilisateur_id, controle_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (controle_id) REFERENCES Controle (id_controle)
);

CREATE TABLE Est_affecte
(
    utilisateur_id   INT,
    code             VARCHAR(50),
    favori           BOOLEAN,
    date_inscription TIMESTAMP,
    PRIMARY KEY (utilisateur_id, code),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (code) REFERENCES UE (code)
);

CREATE TABLE Epingle
(
    utilisateur_id INT,
    publication_id INT,
    date_epingle   TIMESTAMP,
    PRIMARY KEY (utilisateur_id, publication_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (publication_id) REFERENCES Publication (id_publication)
);

-- INSERT 

INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe, telephone, date_creation, date_modification, image)
VALUES ('San', 'M''hammedu', 'mhammedu.san@example.com', 'password123', '+33612345678', '2024-01-15', '2024-01-15',
        'avatar1.jpg'),
       ('Balonu', 'Elmiru', 'elmiru.balonu@example.com', 'securePass456', '+33623456789', '2024-01-20', '2024-02-05',
        'avatar2.jpg'),
       ('Alpuren', 'Enessu', 'enessu.alpuren@example.com', 'alpuren2024', '+33634567890', '2024-01-25', '2024-01-25',
        'avatar3.jpg'),
       ('Vazmazz', 'Evrensan', 'evrensan.vazmazz@example.com', 'vazmazz789!', '+33645678901', '2024-02-01',
        '2024-03-10', 'avatar4.jpg'),
       ('Dubois', 'Marie', 'marie.dubois@example.com', 'dubois123', '+33656789012', '2024-02-05', '2024-02-05',
        'avatar5.jpg'),
       ('Martin', 'Thomas', 'thomas.martin@example.com', 'martinPass', '+33667890123', '2024-02-10', '2024-02-15',
        'avatar6.jpg'),
       ('Bernard', 'Sophie', 'sophie.bernard@example.com', 'sophie2024', '+33678901234', '2024-02-15', '2024-02-15',
        'avatar7.jpg'),
       ('Petit', 'Lucas', 'lucas.petit@example.com', 'petitLucas!', '+33689012345', '2024-02-20', '2024-02-20',
        'avatar8.jpg'),
       ('Robert', 'Emma', 'emma.robert@example.com', 'emmaR2024', '+33690123456', '2024-02-25', '2024-03-01',
        'avatar9.jpg'),
       ('Richard', 'Hugo', 'hugo.richard@example.com', 'hugoRich456', '+33601234567', '2024-03-01', '2024-03-01',
        'avatar10.jpg'),
       ('Kaya', 'Mehmet', 'mehmet.kaya@example.com', 'kayaM2024', '+33634567891', '2024-03-15', '2024-03-15',
        'avatar13.jpg'),
       ('Yilmaz', 'Ayse', 'ayse.yilmaz@example.com', 'yilmazA456!', '+33645678902', '2024-03-20', '2024-03-20',
        'avatar14.jpg');

INSERT INTO Role (nom)
VALUES ('ROLE_ADMINISTRATEUR'),
       ('ROLE_PROFESSEUR'),
       ('ROLE_ELEVE');

INSERT INTO Possede (utilisateur_id, role_id)
VALUES (4, 1), -- User 4 is an admin
       (7, 1), -- User 7 is an admin
       (11, 1); -- User 11 is an admin

INSERT INTO Possede (utilisateur_id, role_id)
VALUES (1, 3), -- User 1 is a student
       (3, 3), -- User 3 is a student
       (5, 3), -- User 5 is a student
       (8, 3), -- User 8 is a student
       (10, 3); -- User 10 is a student

INSERT INTO Possede (utilisateur_id, role_id)
VALUES (2, 2), -- User 2 is a professor
       (9, 2); -- User 9 is a professor

INSERT INTO Possede (utilisateur_id, role_id)
VALUES (6, 1),  -- User 6 is an admin
       (6, 2),  -- User 6 is also a professor
       (12, 1), -- User 12 is an admin
       (12, 2); -- User 12 is also a professor

INSERT INTO Type_publication (nom)
VALUES ('Fichier'),
       ('Message');

INSERT INTO Type_notification (nom)
VALUES ('Affectation à l''UE'),
       ('Désaffectation de l''UE'),
       ('Ajout d''un message'),
       ('Suppression d''un message'),
       ('Ajout d''un fichier'),
       ('Suppression d''un fichier');

INSERT INTO Priorite (nom)
VALUES ('Normale'),
       ('Élevée'),
       ('Ultra-élevée');

