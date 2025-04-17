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
    code_id        VARCHAR(50),
    FOREIGN KEY (code_id) REFERENCES UE (code)
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
    code_id       VARCHAR(50),
    FOREIGN KEY (code_id) REFERENCES UE (code)
);

CREATE TABLE Publication
(
    id_publication      SERIAL PRIMARY KEY,
    titre               VARCHAR(50) NOT NULL,
    description         VARCHAR(50),
    contenu             VARCHAR(50) NOT NULL,
    derniere_modif      TIMESTAMP,
    ordre               INT,
    visible             BOOLEAN NOT NULL,
    section_id          INT,
    utilisateur_id      INT,
    type_publication_id INT,
    code_id             VARCHAR(50),
    FOREIGN KEY (section_id) REFERENCES Section (id_section),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (type_publication_id) REFERENCES Type_publication (id_type_publication),
    FOREIGN KEY (code_id) REFERENCES UE (code)
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
    code_id                       VARCHAR(50) NOT NULL,
    priorite_id                 INT,
    FOREIGN KEY (type_notification_id) REFERENCES Type_notification (id_type_notification),
    FOREIGN KEY (utilisateur_expediteur_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (utilisateur_destinataire_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (code_id) REFERENCES UE (code),
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
    code_id             VARCHAR(50),
    favori           BOOLEAN,
    date_inscription TIMESTAMP,
    PRIMARY KEY (utilisateur_id, code_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur),
    FOREIGN KEY (code_id) REFERENCES UE (code)
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


INSERT INTO UE (
    code,
    nom,
    description,
    semestre,
    image
)
VALUES
    (
        'WE4A',
        'Développement Web - PHP',
        'Nous apprenons les bases du développement web en passant par HTML, CSS, Javascript ainsi que PHP',
        'Semestre 2',
        'banner-we4a.jpg'
    ),
    (
        'SY43',
        'Développement Mobile - Android',
        'Introduction au développement mobile sur Android avec Java et Kotlin',
        'Semestre 2',
        'banner-sy43.jpg'
    ),
    (
        'SI40',
        'Bases de données - SQL',
        'Apprentissage des bases de données, de la modélisation à l''utilisation de SQL pour interagir avec les données',
        'Semestre 2',
        'banner-si40.jpg'
    ),
    (
        'RS40',
        'Sécurité Informatique',
        'Introduction à la sécurité informatique et aux techniques pour protéger les systèmes et réseaux',
        'Semestre 2',
        'banner-rs40.jpg'
    ),
    (
        'UX3E',
        'UX/UI Design',
        'Introduction aux concepts de design d''interface et d''expérience utilisateur, avec une approche pratique des outils comme Figma et Sketch',
        'Semestre 1',
        'banner-ux3e.jpg'
    ),
    (
        'RE4E',
        'Réseaux et Télécommunications',
        'Les concepts fondamentaux des réseaux informatiques et des télécommunications, avec un focus sur les protocoles réseau et l''architecture',
        'Semestre 1',
        'banner-re4e.jpg'
    ),
    (
        'IA41',
        'Intelligence Artificielle - Introduction',
        'Ce cours explore les bases de l’intelligence artificielle, y compris l’apprentissage supervisé et non supervisé, les réseaux neuronaux, etc.',
        'Semestre 1',
        'banner-ia41.jpg'
    ),
    (
        'GD2H',
        'Gestion de Projet Informatique',
        'Les principes de la gestion de projet informatique, de la planification à la gestion des risques et des ressources',
        'Semestre 2',
        'banner-gd2h.jpg'
    ),
    (
        'ML6I',
        'Apprentissage Automatique (Machine Learning)',
        'Introduction à l’apprentissage automatique, avec une étude des modèles de régression, de classification et des réseaux neuronaux',
        'Semestre 1',
        'banner-ml6i.jpg'
    ),
    (
        'BD4J',
        'Blockchain et Cryptomonnaies',
        'Un cours sur les principes de la blockchain, de la cryptomonnaie, ainsi que des applications modernes de cette technologie',
        'Semestre 2',
        'banner-bd4j.jpg'
    );


INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (2, 'BD4J', TRUE, '2025-04-15 08:30:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (2, 'ML6I', FALSE, '2025-04-14 10:45:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (2, 'GD2H', TRUE, '2025-04-12 14:20:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (2, 'IA41', FALSE, '2025-04-10 16:00:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (2, 'RE4E', TRUE, '2025-04-09 12:05:00');

UPDATE Utilisateur set image='mhammed.jpeg';