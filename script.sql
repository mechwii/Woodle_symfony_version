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

CREATE TABLE Utilisateur(
   id_utilisateur SERIAL PRIMARY KEY,
   nom VARCHAR(100),
   prenom VARCHAR(100),
   email VARCHAR(255),
   mot_de_passe VARCHAR(255),
   telephone VARCHAR(50),
   date_creation DATE,
   date_modification DATE,
   image VARCHAR(255)
);

CREATE TABLE Role(
   id_role SERIAL PRIMARY KEY,
   nom VARCHAR(255)
);

CREATE TABLE UE(
   code VARCHAR(50) PRIMARY KEY,
   nom VARCHAR(100),
   description VARCHAR(50),
   semestre VARCHAR(50),
   image VARCHAR(255)
);

CREATE TABLE Type_publication(
   id_type_publication SERIAL PRIMARY KEY,
   nom VARCHAR(50)
);

CREATE TABLE Type_notification(
   id_type_notification SERIAL PRIMARY KEY,
   nom VARCHAR(50)
);

CREATE TABLE Controle(
   id_controle SERIAL PRIMARY KEY,
   nom VARCHAR(50),
   code VARCHAR(50) NOT NULL,
   FOREIGN KEY(code) REFERENCES UE(code)
);

CREATE TABLE Priorite(
   id_priorite SERIAL PRIMARY KEY,
   nom VARCHAR(50)
);

CREATE TABLE Section(
   id_section SERIAL PRIMARY KEY,
   nom VARCHAR(50),
   code VARCHAR(50) NOT NULL,
   FOREIGN KEY(code) REFERENCES UE(code)
);

CREATE TABLE Publication(
   id_publication SERIAL PRIMARY KEY,
   titre VARCHAR(50),
   description VARCHAR(50),
   contenu VARCHAR(50),
   derniere_modif DATE,
   ordre INT,
   visible BOOLEAN,
   id_section INT NOT NULL,
   id_utilisateur INT NOT NULL,
   id_type_publication INT NOT NULL,
   code VARCHAR(50) NOT NULL,
   FOREIGN KEY(id_section) REFERENCES Section(id_section),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateur(id_utilisateur),
   FOREIGN KEY(id_type_publication) REFERENCES Type_publication(id_type_publication),
   FOREIGN KEY(code) REFERENCES UE(code)
);

CREATE TABLE Notification(
   id_notification SERIAL PRIMARY KEY,
   contenu VARCHAR(255),
   date_notif DATE,
   url_destination VARCHAR(255),
   id_type_notification INT NOT NULL,
   id_utilisateur_expediteur INT NOT NULL,
   id_utilisateur_destinataire INT NOT NULL,
   code VARCHAR(50) NOT NULL,
   id_priorite INT NOT NULL,
   FOREIGN KEY(id_type_notification) REFERENCES Type_notification(id_type_notification),
   FOREIGN KEY(id_utilisateur_expediteur) REFERENCES Utilisateur(id_utilisateur),
   FOREIGN KEY(id_utilisateur_destinataire) REFERENCES Utilisateur(id_utilisateur),
   FOREIGN KEY(code) REFERENCES UE(code),
   FOREIGN KEY(id_priorite) REFERENCES Priorite(id_priorite)
);

CREATE TABLE Possede(
   id_utilisateur INT,
   id_role INT,
   PRIMARY KEY(id_utilisateur, id_role),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateur(id_utilisateur),
   FOREIGN KEY(id_role) REFERENCES Role(id_role)
);

CREATE TABLE Note(
   id_utilisateur INT,
   id_controle INT,
   resultat INT,
   PRIMARY KEY(id_utilisateur, id_controle),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateur(id_utilisateur),
   FOREIGN KEY(id_controle) REFERENCES Controle(id_controle)
);

CREATE TABLE Est_affecte(
   id_utilisateur INT,
   code VARCHAR(50),
   favori BOOLEAN,
   date_inscription DATE,
   PRIMARY KEY(id_utilisateur, code),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateur(id_utilisateur),
   FOREIGN KEY(code) REFERENCES UE(code)
);

CREATE TABLE Epingle(
   id_utilisateur INT,
   id_publication INT,
   date_epingle DATE,
   PRIMARY KEY(id_utilisateur, id_publication),
   FOREIGN KEY(id_utilisateur) REFERENCES Utilisateur(id_utilisateur),
   FOREIGN KEY(id_publication) REFERENCES Publication(id_publication)
);

-- INSERT 

INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe, telephone, date_creation, date_modification, image) VALUES
('San', 'M''hammedu', 'mhammedu.san@example.com', 'password123', '+33612345678', '2024-01-15', '2024-01-15', 'avatar1.jpg'),
('Balonu', 'Elmiru', 'elmiru.balonu@example.com', 'securePass456', '+33623456789', '2024-01-20', '2024-02-05', 'avatar2.jpg'),
('Alpuren', 'Enessu', 'enessu.alpuren@example.com', 'alpuren2024', '+33634567890', '2024-01-25', '2024-01-25', 'avatar3.jpg'),
('Vazmazz', 'Evrensan', 'evrensan.vazmazz@example.com', 'vazmazz789!', '+33645678901', '2024-02-01', '2024-03-10', 'avatar4.jpg'),
('Dubois', 'Marie', 'marie.dubois@example.com', 'dubois123', '+33656789012', '2024-02-05', '2024-02-05', 'avatar5.jpg'),
('Martin', 'Thomas', 'thomas.martin@example.com', 'martinPass', '+33667890123', '2024-02-10', '2024-02-15', 'avatar6.jpg'),
('Bernard', 'Sophie', 'sophie.bernard@example.com', 'sophie2024', '+33678901234', '2024-02-15', '2024-02-15', 'avatar7.jpg'),
('Petit', 'Lucas', 'lucas.petit@example.com', 'petitLucas!', '+33689012345', '2024-02-20', '2024-02-20', 'avatar8.jpg'),
('Robert', 'Emma', 'emma.robert@example.com', 'emmaR2024', '+33690123456', '2024-02-25', '2024-03-01', 'avatar9.jpg'),
('Richard', 'Hugo', 'hugo.richard@example.com', 'hugoRich456', '+33601234567', '2024-03-01', '2024-03-01', 'avatar10.jpg'),
('Kaya', 'Mehmet', 'mehmet.kaya@example.com', 'kayaM2024', '+33634567891', '2024-03-15', '2024-03-15', 'avatar13.jpg'),
('Yilmaz', 'Ayse', 'ayse.yilmaz@example.com', 'yilmazA456!', '+33645678902', '2024-03-20', '2024-03-20', 'avatar14.jpg');

INSERT INTO Role (nom) VALUES
('ROLE_ADMINISTRATEUR'),
('ROLE_PROFESSEUR'),
('ROLE_ELEVE');

INSERT INTO Possede (id_utilisateur, id_role) VALUES
(4, 1),  -- User 4 is an admin
(7, 1),  -- User 7 is an admin
(11, 1); -- User 11 is an admin

INSERT INTO Possede (id_utilisateur, id_role) VALUES
(1, 3),  -- User 1 is a student
(3, 3),  -- User 3 is a student
(5, 3),  -- User 5 is a student
(8, 3),  -- User 8 is a student
(10, 3); -- User 10 is a student

INSERT INTO Possede (id_utilisateur, id_role) VALUES
(2, 2),  -- User 2 is a professor
(9, 2);  -- User 9 is a professor

INSERT INTO Possede (id_utilisateur, id_role) VALUES
(6, 1),  -- User 6 is an admin
(6, 2),  -- User 6 is also a professor
(12, 1), -- User 12 is an admin
(12, 2); -- User 12 is also a professor

INSERT INTO Type_publication (nom) VALUES
('Fichier'),
('Message');

INSERT INTO Type_notification (nom) VALUES
('Affectation à l''UE'),
('Désaffectation de l''UE'),
('Ajout d''un message'),
('Suppression d''un message'),
('Ajout d''un fichier'),
('Suppression d''un fichier');

INSERT INTO Priorite (nom) VALUES
('Normale'),
('Élevée'),
('Ultra-élevée');

