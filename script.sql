DROP TABLE IF EXISTS Epingle CASCADE;
DROP TABLE IF EXISTS Est_affecte CASCADE;
DROP TABLE IF EXISTS Note CASCADE;
DROP TABLE IF EXISTS Possede CASCADE;
DROP TABLE IF EXISTS Notification CASCADE;
DROP TABLE IF EXISTS Publication CASCADE;
DROP TABLE IF EXISTS Section CASCADE;
DROP TABLE IF EXISTS Priorite CASCADE;
DROP TABLE IF EXISTS Controle CASCADE;
DROP TABLE IF EXISTS UE CASCADE;
DROP TABLE IF EXISTS Type_notification CASCADE;
DROP TABLE IF EXISTS Type_publication CASCADE;
DROP TABLE IF EXISTS Role CASCADE;
DROP TABLE IF EXISTS Utilisateur CASCADE;

CREATE TABLE Utilisateur
(
    id_utilisateur    SERIAL PRIMARY KEY,
    nom               VARCHAR(100) NOT NULL,
    prenom            VARCHAR(100) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    mot_de_passe      VARCHAR(255) NOT NULL,
    date_creation     TIMESTAMP,
    date_modification TIMESTAMP,
    image             VARCHAR(255) NOT NULL
);

CREATE TABLE Role
(
    id_role SERIAL PRIMARY KEY,
    nom     VARCHAR(100) NOT NULL
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

CREATE TABLE UE
(
    code        VARCHAR(50) PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    image       VARCHAR(255) NOT NULL,
    responsable_id INT,
    FOREIGN KEY (responsable_id) REFERENCES Utilisateur(id_utilisateur) ON DELETE SET NULL
);

CREATE TABLE Controle
(
    id_controle SERIAL PRIMARY KEY,
    nom         VARCHAR(50) NOT NULL,
    code_id        VARCHAR(50),
    FOREIGN KEY (code_id) REFERENCES UE (code) ON DELETE CASCADE
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
    FOREIGN KEY (code_id) REFERENCES UE (code) ON DELETE CASCADE
);

CREATE TABLE Publication
(
    id_publication      SERIAL PRIMARY KEY,
    titre               VARCHAR(50) NOT NULL,
    description         VARCHAR(50),
    contenu_texte       TEXT,
    contenu_fichier     VARCHAR(255),
    derniere_modif      TIMESTAMP,
    ordre               INT,
    visible             BOOLEAN NOT NULL,
    section_id          INT,
    utilisateur_id      INT,
    type_publication_id INT,
    code_id             VARCHAR(50),
    FOREIGN KEY (section_id) REFERENCES Section (id_section),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur) ON DELETE SET NULL,
    FOREIGN KEY (type_publication_id) REFERENCES Type_publication (id_type_publication),
    FOREIGN KEY (code_id) REFERENCES UE (code) ON DELETE CASCADE
);

CREATE TABLE Notification
(
    id_notification             SERIAL PRIMARY KEY,
    contenu                     TEXT NOT NULL,
    date_notif                  TIMESTAMP,
    url_destination             VARCHAR(255) NOT NULL,
    type_notification_id        INT,
    utilisateur_expediteur_id   INT,
    utilisateur_destinataire_id INT NOT NULL,
    code_id                       VARCHAR(50) NOT NULL,
    priorite_id                 INT,
    FOREIGN KEY (type_notification_id) REFERENCES Type_notification (id_type_notification),
    FOREIGN KEY (utilisateur_expediteur_id) REFERENCES Utilisateur (id_utilisateur) ON DELETE SET NULL,
    FOREIGN KEY (utilisateur_destinataire_id) REFERENCES Utilisateur (id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (code_id) REFERENCES UE (code) ON DELETE CASCADE ,
    FOREIGN KEY (priorite_id) REFERENCES Priorite (id_priorite)
);

CREATE TABLE Possede
(
    utilisateur_id INT,
    role_id        INT,
    PRIMARY KEY (utilisateur_id, role_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Role (id_role)
);

CREATE TABLE Note
(
    utilisateur_id INT,
    controle_id    INT,
    resultat       INT NOT NULL,
    PRIMARY KEY (utilisateur_id, controle_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur) ON DELETE CASCADE ,
    FOREIGN KEY (controle_id) REFERENCES Controle (id_controle)
);

CREATE TABLE Est_affecte
(
    utilisateur_id   INT NOT NULL ,
    code_id          VARCHAR(50) NOT NULL,
    favori           BOOLEAN,
    date_inscription TIMESTAMP,
    PRIMARY KEY (utilisateur_id, code_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur) ON DELETE CASCADE ,
    FOREIGN KEY (code_id) REFERENCES UE (code) ON DELETE CASCADE
);

CREATE TABLE Epingle
(
    utilisateur_id INT,
    publication_id INT,
    date_epingle   TIMESTAMP,
    PRIMARY KEY (utilisateur_id, publication_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur (id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (publication_id) REFERENCES Publication (id_publication) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION maj_dates_utilisateur()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.date_creation := NOW();
        NEW.date_modification := NOW();
    ELSIF (TG_OP = 'UPDATE') THEN
        NEW.date_modification := NOW();
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maj_dates_utilisateur
    BEFORE INSERT OR UPDATE ON Utilisateur
        FOR EACH ROW
            EXECUTE FUNCTION maj_dates_utilisateur();

CREATE OR REPLACE FUNCTION maj_date_affection()
RETURNS TRIGGER AS $$
BEGIN
    IF(TG_OP = 'INSERT') THEN
      NEW.date_inscription := NOW();
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maj_affectation
BEFORE INSERT  ON Est_Affecte
FOR EACH ROW
EXECUTE FUNCTION maj_date_affection();



CREATE OR REPLACE FUNCTION maj_dates_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.date_notif := NOW();
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maj_notification
    BEFORE INSERT OR UPDATE ON Notification
                         FOR EACH ROW
                         EXECUTE FUNCTION maj_dates_notification();

CREATE OR REPLACE FUNCTION maj_ordre_publication()
RETURNS TRIGGER AS $$
DECLARE
max_ordre INT;
BEGIN
SELECT COALESCE(MAX(ordre), 0)
INTO max_ordre
FROM Publication
WHERE section_id = NEW.section_id;
NEW.ordre := max_ordre + 1;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_maj_ordre_publication
    BEFORE INSERT ON Publication
    FOR EACH ROW
    EXECUTE FUNCTION maj_ordre_publication();



-- INSERT

INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe, date_creation, date_modification, image)
VALUES ('San', 'M''hammedu', 'mhammedu.san@example.com', 'password123', '2024-01-15', '2024-01-15',
        'mhammed.jpeg'),
       ('Balonu', 'Elmiru', 'elmiru.balonu@example.com', 'securePass456', '2024-01-20', '2024-02-05',
        'elmir.jpg'),
       ('Alpuren', 'Enessu', 'enessu.alpuren@example.com', 'alpuren2024', '2024-01-25', '2024-01-25',
        'enes.jpg'),
       ('Vazmazz', 'Evrensan', 'evrensan.vazmazz@example.com', 'vazmazz789!', '2024-02-01',
        '2024-03-10', 'evren.jpg'),
       ('Dubois', 'Marie', 'marie.dubois@example.com', 'dubois123', '2024-02-05', '2024-02-05',
        'marie.jpg'),
       ('Martin', 'Thomas', 'thomas.martin@example.com', 'martinPass', '2024-02-10', '2024-02-15',
        'thomas.jpg'),
       ('Bernard', 'Arthur', 'arthur.bernard@example.com', 'arthur2024', '2024-02-15', '2024-02-15',
        'bernard.jpg'),
       ('Petit', 'Lucas', 'lucas.petit@example.com', 'petitLucas!', '2024-02-20', '2024-02-20',
        'lucas.jpg'),
       ('Robert', 'Emma', 'emma.robert@example.com', 'emmaR2024',  '2024-02-25', '2024-03-01',
        'robert.jpeg'),
       ('Richard', 'Hugo', 'hugo.richard@example.com', 'hugoRich456', '2024-03-01', '2024-03-01',
        'hugo.jpeg'),
       ('Kaya', 'Mehmet', 'mehmet.kaya@example.com', 'kayaM2024',  '2024-03-15', '2024-03-15',
        'mehmet.jpg'),
       ('Yilmaz', 'Ayse', 'ayse.yilmaz@example.com', 'yilmazA456!', '2024-03-20', '2024-03-20',
        'ayse.jpeg');

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
VALUES ('Message'),
       ('Fichier');

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
    image,
    responsable_id
)
VALUES
    (
        'WE4A',
        'Développement Web - PHP',
        'banner-we4a.jpg',
     9
    ),
    (
        'SY43',
        'Développement Mobile - Android',
        'banner-sy43.jpg',
        9
    ),
    (
        'SI40',
        'Bases de données - SQL',
        'banner-si40.jpg',
        9
    ),
    (
        'RS40',
        'Sécurité Informatique',
        'banner-rs40.jpg',
        9
    ),
    (
        'UX3E',
        'UX/UI Design',
        'banner-ux3e.jpg',
        9
    ),
    (
        'RE4E',
        'Réseaux et Télécommunications',
        'banner-re4e.jpg',
        9
    ),
    (
        'IA41',
        'Intelligence Artificielle - Introduction',
        'banner-ia41.jpg',
        9
    ),
    (
        'GD2H',
        'Gestion de Projet Informatique',
        'banner-gd2h.jpg',
        9
    ),
    (
        'ML6I',
        'Apprentissage Automatique (Machine Learning)',
        'banner-ml6i.jpg',
        9
    ),
    (
        'BD4J',
        'Blockchain et Cryptomonnaies',
        'banner-bd4j.jpg',
        9
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

INSERT INTO Section (nom, code_id)
VALUES
    ('Cours Magistraux', 'IA41'),
    ('TP', 'IA41'),
    ('TD', 'IA41');

INSERT INTO publication (titre, description, contenu_texte, derniere_modif, ordre, visible, section_id, utilisateur_id, type_publication_id, code_id)
VALUES
    ('Salut la team zer', 'Une analyse des ...', 'Contenu détaillé de la publication...', '2025-04-19 10:00:00', 1, TRUE, 1, 2, 1, 'IA41'),
    ('Apaya', 'Une étude approfondie des.', 'Contenu détaillé de la publication...', '2025-04-19 11:00:00', 2, TRUE, 2, 3, 1, 'IA41'),
    ('Quoicoubeh', 'Un regard sur l’évolution de.', 'Contenu détaillé de la publication...', '2025-04-19 12:00:00', 3, TRUE, 3, 5, 1, 'IA41');


INSERT INTO Epingle (utilisateur_id, publication_id, date_epingle)
VALUES
    (2, 1, '2025-04-19 10:30:00'),
    (3, 2, '2025-04-19 11:30:00'),
    (5, 3, '2025-04-19 12:30:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (1, 'IA41', TRUE, '2025-04-09 12:05:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (3, 'IA41', TRUE, '2025-04-09 12:05:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (5, 'IA41', TRUE, '2025-04-09 12:05:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (8, 'IA41', TRUE, '2025-04-09 12:05:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (9, 'IA41', TRUE, '2025-04-09 12:05:00');

INSERT INTO Est_affecte (utilisateur_id, code_id, favori, date_inscription)
VALUES (6, 'IA41', TRUE, '2025-04-09 12:05:00');


-- Ajout des types de publicatinos différents
INSERT INTO type_publication (id_type_publication, nom)
VALUES
    (3, 'evenement'),
    (4, 'important'),
    (5, 'information');


INSERT INTO publication (titre, description, contenu_texte, derniere_modif, visible, section_id, utilisateur_id, type_publication_id, code_id)
VALUES
    ( 'Hmmm comment ca va la team', 'Une analyse des ...', 'Contenu détaillé de la publication...', '2025-04-19 10:00:00', TRUE, 1, 2, 3, 'IA41'),
    ('Absence au prochain TD', 'Une étude approfondie des.', 'Contenu détaillé de la publication...', '2025-04-19 11:00:00', TRUE, 2, 3, 4, 'IA41'),
    ('CM annulé', 'Un regard sur l’évolution de.', 'Contenu détaillé de la publication...', '2025-04-19 12:00:00', TRUE, 3, 5, 5, 'IA41');

INSERT INTO Priorite(nom) VALUES
    ('normale'),('élevé');
