document.addEventListener('DOMContentLoaded', function (){
    // code pour afficher la liste des users profs/etudiants
    afficherListesUsers();

    // ajouter une section
    ajouterSection();

    //editer une section
    editSection();

    // supprimer une section
    deleteSection();

    // ajouter une publication
    ajouterPublication();

    //editer une publication
    editPublication();

    //supprimer une publication
    supprimerPublication();

    // gestion de l'epinglement
    epinglement();
})


// Fonction pour afficher les listes d'utilisateurs dans la rubrique statistiques

function afficherListesUsers() {

    // recuperation des elements dont on a besoin pour afficher la liste des utilisateurs

    const popupListeUsers = document.querySelector("div.popUpListe");
    const popupAddSection = document.querySelector("div.popupAddSection");

    const boutonSection = document.querySelector("button.add_section");
    const buttonStatsEleves = document.querySelector("div.statistiques-section.eleves");
    const buttonStatsProfesseurs = document.querySelector("div.statistiques-section.professeurs");


    const switchBgListe = document.querySelector(".switch-background-liste");
    const boutonStudent = document.querySelector(".boutonsSwitchListes .student");
    const boutonTeacher = document.querySelector(".boutonsSwitchListes .teacher");

    const listeData = document.getElementById("liste-data");


    // quand on clique sur le bouton etudiant la barre bouge graphiquement et on affiche la lisste des etudaints
    boutonStudent.addEventListener("click", () => {
        switchBgListe.style.left = "0%";
        boutonStudent.style.color = "white";
        boutonTeacher.style.color = "black";
        afficherListeUser("student", listeData);
    });

    // quand on clique sur le bouton professeur la barre bouge graphiquement et on affiche la liste des professeurs
    boutonTeacher.addEventListener("click", () => {
        switchBgListe.style.left = "50%";
        boutonStudent.style.color = "black";
        boutonTeacher.style.color = "white";
        afficherListeUser("teacher", listeData);
    });

    // quand on clique sur le div etudiant la barre bouge graphiquement et on affiche la lisste des etudaints

    buttonStatsEleves.addEventListener("click", () => {
        openPopup(popupListeUsers);
        switchBgListe.style.left = "0%";
        boutonStudent.style.color = "white";
        boutonTeacher.style.color = "black";
        afficherListeUser("student", listeData);
    });

    // quand on clique sur le div professeurs la barre bouge graphiquement et on affiche la lisste des professeurs

    buttonStatsProfesseurs.addEventListener("click", () => {
        openPopup(popupListeUsers);
        switchBgListe.style.left = "50%";
        boutonStudent.style.color = "black";
        boutonTeacher.style.color = "white";
        afficherListeUser("teacher", listeData);
    });
}

// ----- OUTILS GENERIQUES POUR LES POPUPS -----

function openPopup(popup) {
    // quand on ouvre une popup on ferme toutes les autres popups
    closeAllPopups();

    // recuperaiton des elements lies aux popup
    const switchBg = document.querySelector(".switch-background");
    const boutonText = document.querySelector(".boutonsSwitch .text");
    const boutonFile = document.querySelector(".boutonsSwitch .file");
    const darkBackground = document.querySelector("div.darkBackground");

    // quand on clique sur le fond noir la popup disparait
    darkBackground.addEventListener('click', function (){
        darkBackground.classList.add('hidden');
        document.querySelector('div.popupPublication').classList.add('hidden');
    })

    // Le style affiche par défaut le texte dans la popup de création de publication
    switchBg.style.left = "0%";
    boutonText.style.color = "white";
    boutonFile.style.color = "black";
    popup.classList.remove("hidden");
    darkBackground.classList.remove("hidden");
    boutonText.style.color = "white";

    // quand on appuie ssur le bouton texte danss la popup c'est le formulaire de publication texte qui apparait, et la barre bouge graphiquement
    boutonText.addEventListener("click", () => {
        switchBg.style.left = "0%";
        boutonText.style.color = "white";
        boutonFile.style.color = "black";
        afficherFormulaire("texte");
    });

    // quand on appuie ssur le bouton fichier danss la popup c'est le formulaire de publication fichier qui apparait, et la barre bouge graphiquement

    boutonFile.addEventListener("click", () => {
        switchBg.style.left = "50%";
        boutonText.style.color = "black";
        boutonFile.style.color = "white";
        afficherFormulaire("fichier");
    });
}

function closeAllPopups() {

    // on recupere toutes les popups et le fond noir
    const darkBackground = document.querySelector("div.darkBackground");
    const allPopups = document.querySelectorAll(".popup");

    // pour chaque popup et le dark background on ajoute la classe hidden
    allPopups.forEach(p => p.classList.add("hidden"));
    darkBackground.classList.add("hidden");

    // on recupere le bouton de confirmation de suppression de post
    const confirmBtn_post = document.querySelector('.confirm-btn-post');

    // s'il existe
    if(confirmBtn_post){
        // on lui enleve son ecouteur d'evenement
        confirmBtn_post.removeEventListener('click', () => {
            if (!publicationIdToDelete) return;

            // on recupere le code de l'ue dans laquelle on est
            const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
            console.log(codeUe);

            // envoie de requete GET pour supprimer une publication
            fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionIdToDeleteForPublication}/publication/${publicationIdToDelete}/delete`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success' && publicationToDelete) {
                        // si la reponse est un success on supprime vissuellement
                        publicationToDelete.remove();
                        console.log("publication supprimée avec succès")
                    }

                    // et on reset les id qu'on a stocker dans les variables precedemment
                    modal_post.classList.add('hidden');
                    backdrop_post.classList.add('hidden');
                    sectionToDeleteForPublication = null;
                    sectionIdToDeleteForPublication = null;
                    publicationToDelete = null;
                    publicationIdToDelete = null;
                })
                .catch(err => {
                    console.log("par la");

                    console.error("Erreur AJAX :", err);
                });
        })
    }

    // recuperation du bouton de confirmation pour ssupprimer une section
    const confirmBtn = document.querySelector('.confirm-btn-section');

    if(confirmBtn){
        // on lui enleve lecouteur devenement pour empecher les duplications d'appel lors des rebinds
        confirmBtn.removeEventListener('click', () => {

            if (!sectionIdToDelete) return;

            // recuperation du code ue de l'ue dans laquelle on est
            const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
            console.log(codeUe);

            // appel fetch delete pour supprimer une section
            fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionIdToDelete}/delete`, {
                method: 'DELETE'
            })
                .then(res => {
                    if (!res.ok) {
                        // Si la réponse n'est pas OK-> erreur
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.status === 'success' && sectionToDelete) {
                        // si reponse success on supprime visuellement
                        sectionToDelete.remove();
                        console.log("section supprimée avec succès");
                    } else {
                        console.error("Erreur côté serveur :", data.message || "Erreur inconnue.");
                    }

                    // on resset les variables avec les ID
                    modal.classList.add('hidden');
                    backdrop.classList.add('hidden');
                    sectionToDelete = null;
                    sectionIdToDelete = null;
                })
                .catch(err => {
                    console.error("Erreur AJAX capturée:", err.message);
                    modal.classList.add('hidden');
                    backdrop.classList.add('hidden');
                    sectionToDelete = null;
                    sectionIdToDelete = null;
                });

        });
    }



}


// ----- POPUP LISTE USERS -----

// Fonction pour afficher une popup contenant la liste des utilisateurs (élèves ou professeurs)
function afficherListeUser(type, listeData) {

    // Récupération des données JSON encodées dans les attributs data du HTML
    const eleves = JSON.parse(listeData.dataset.eleves);
    const profs = JSON.parse(listeData.dataset.profs);

    // Sélection du conteneur HTML où afficher la liste des utilisateurs
    const containerListe = document.querySelector(".containerListe");

    // Selon le type passé ("student" ou autre), on choisit la bonne liste
    const data = type === "student" ? eleves : profs;

    // On génère le HTML de chaque utilisateur à afficher dans la liste
    const html = data.map(user => `
        <div class="row-user">
            <img src="../images/profil/${user.image}" alt="photo de ${user.prenom}">
            <div class="infos-text">
                <div class="name">
                    <span class="prenom">${user.prenom}</span>
                    <span class="nom">${user.nom}</span>
                </div>
                <span class="email">${user.email}</span>
            </div>
        </div>`).join(""); // On rejoint toutes les chaînes générées en un seul bloc HTML

    // On injecte la liste générée dans le container avec une classe conditionnelle selon le type
    containerListe.innerHTML = `<div class="${type === "student" ? "liste-etudiants" : "liste-professeurs"}">${html}</div>`;

    // On ferme la popup si on clique sur l'arrière-plan sombre
    document.querySelector("div.darkBackground").addEventListener('click', function () {
        closeAllPopups();
    })
}



function ajouterSection() {
    // Récupération de la popup de création et de l'arrière-plan sombre pour fermer la popup
    const popupContainer = document.querySelector('.popupAddSection');
    const background = document.querySelector('.darkBackground');

    // Récupération du code de l'UE
    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);

// Ouvrir la popup de création
    // Ajout d'un écouteur d'événement sur le bouton de création d'une section
    document.querySelector('.add_section').addEventListener('click', () => {
        console.log(document.querySelector('.add_section'));

        // Envoi d'une requête fetch pour récupérer le formulaire de création d'une section
        fetch(`/professeur/contenu_ue-${codeUe}/section/create`)
            .then(res => res.json())
            .then(data => {
                // Si la réponse contient un formulaire (status === 'form')
                if (data.status === 'form') {
                    // On place le contenu du formulaire dans le container de la popup
                    popupContainer.innerHTML = data.html;

                    // Affichage de la popup et de l'arrière-plan sombre
                    popupContainer.classList.remove('hidden');
                    background.classList.remove('hidden');

                    // Ajout d'un événement sur le clic de l'arrière-plan sombre pour fermer la popup
                    background.addEventListener('click', function () {
                        background.classList.add('hidden');
                        popupContainer.classList.add('hidden');
                    } )

                    // Appel à la fonction attachCreateFormSubmit pour gérer l'envoi du formulaire
                    attachCreateFormSubmit();
                }
            });

    });

    // Cache la popup et l'arrière-plan
    background.classList.add('hidden');
    document.querySelector('.popupAddSection').classList.add('hidden');
}




// Gérer la soumission du formulaire de modification
function attachCreateFormSubmit() {

    // Récupère le formulaire de création de section
    const form = document.querySelector('.create-section-form');

    // Récupère le container de la popup et l'arrière-plan sombre pour la gestion de la popup
    const popupContainer = document.querySelector('.popupAddSection');
    const background = document.querySelector('.darkBackground');

    // Si le formulaire n'est pas trouvé, on arrête l'exécution de la fonction
    if (!form) return;

    // Ajoute un écouteur d'événement pour la soumission du formulaire
    form.addEventListener('submit', e => {
        e.preventDefault();

        const formData = new FormData(form); // Crée un objet FormData contenant les données du formulaire

        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe
        console.log(codeUe);

        // Envoie les données du formulaire au serveur via une requête POST
        fetch(`/professeur/contenu_ue-${codeUe}/section/create`, {
            method: 'POST',
            body: formData // Corps de la requête contenant les données du formulaire
        })
            .then(async res => {
                const contentType = res.headers.get("content-type");

                // Si le type de contenu est JSON, on le parse
                if (contentType && contentType.includes("application/json")) {
                    return res.json();
                } else {
                    // Si la réponse n'est pas en JSON, on affiche l'erreur
                    const text = await res.text();
                    console.error("Erreur : réponse non JSON reçue", text);
                    throw new Error("Réponse non-JSON");
                }
            })
            .then(data => {
                // Si le serveur a renvoyé une réponse avec un statut 'success'
                if (data.status === 'success') {
                    // Récupère le container qui contient les sections
                    const sectionContainer = document.querySelector('.sections-wrapper');

                    // Crée un nouvel élément temporaire pour insérer le HTML reçu
                    const temp = document.createElement('div');
                    temp.innerHTML = data.html;

                    // Récupère la première section
                    const newSection = temp.firstElementChild;

                    // On cherche la classe de la section qui commence par 'section-'
                    const classList = Array.from(newSection.classList);
                    const sectionClass = classList.find(cls => cls.startsWith('section-'));

                    // Si la classe contenant l'ID de la section est trouvée
                    if (sectionClass) {
                        const sectionId = sectionClass.split('-')[1]; // Extrait l'ID de la section de la classe
                        newSection.setAttribute('data-section-id', sectionId); // Ajoute l'ID de la section comme attribut data
                        console.log('Section ID attribué :', sectionId);
                    }

                    // Ajoute la nouvelle section au container des sections
                    sectionContainer.appendChild(newSection);

                    // ici fonction de rebind pour edit
                    bindEditSectionButtons();

                    //ici fonciton de bind pour suppr
                    deleteSection();

                    //ici bind pour ajt
                    ajouterPublication();

                    // Cache la popup et l'arrière-plan sombre après la création de la section
                    popupContainer.classList.add('hidden');
                    background.classList.add('hidden');
                } else if (data.status === 'form') {
                    // Si le statut est 'form', le formulaire de création a échoué et on le recharge
                    popupContainer.innerHTML = data.html;
                    // Rappelle la fonction pour réattacher le gestionnaire de soumission au formulaire
                    attachCreateFormSubmit();
                }
            })

    });

}

// editer une section
function editSection() {

    // recuperation du code UE de l'UE dans laquelle on est
    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);

// Ouvrir la popup de modification de la section
    bindEditSectionButtons();

}

function bindEditSectionButtons() {

    // Récupère le container de la popup d'édition et l'arrière-plan sombre
    const popupContainer = document.querySelector('.popupEditSectionContainer');
    const background = document.querySelector('.darkBackground');

    // Récupère le code de l'UE
    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);

    // Sélectionne tous les boutons d'édition (éléments avec la classe '.edit_section')

    document.querySelectorAll('.edit_section').forEach(btn => {
        // Pour chaque bouton, on ajoute un gestionnaire d'événements
        btn.addEventListener('click', () => {

            // Trouve la section la plus proche du bouton cliqué
            const sectionDiv = btn.closest('.section');
            // Récupère l'ID de la section en analysant la classe de l'élément (qui est supposée être sous la forme 'section-XX')
            const sectionId = sectionDiv.classList[1].split('-')[1];

            // Envoie une requête GET pour récupérer le formulaire d'édition de la section
            fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionId}/edit`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'form') {
                        // On remplace le contenu de la popup avec le HTML du formulaire d'édition
                        popupContainer.innerHTML = data.html;
                        // Affiche la popup et l'arrière-plan sombre
                        popupContainer.classList.remove('hidden');
                        background.classList.remove('hidden');

                        // Ajoute un écouteur d'événement pour fermer la popup lorsque l'on clique sur l'arrière-plan sombre
                        background.addEventListener('click', function () {
                            background.classList.add('hidden');
                            popupContainer.classList.add('hidden');
                        })
                        // Appelle la fonction pour lier la soumission du formulaire d'édition
                        attachEditFormSubmit(sectionId);
                    }
                });

        });
    });
    // Cache la popup et l'arrière-plan sombre dès que la fonction est exécutée (avant toute interaction)
    background.classList.add('hidden');
    popupContainer.classList.add('hidden');
}


// Gérer la soumission du formulaire de modification
function attachEditFormSubmit(sectionId) {

    // Récupère le code de l'UE
    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);
    // Sélectionne le formulaire d'édition de la section
    const form = document.querySelector('.edit-section-form');

    // Ajoute un gestionnaire d'événements pour gérer la soumission du formulaire
    form.addEventListener('submit', e => {
        e.preventDefault();

        // Crée un objet FormData à partir du formulaire. Cet objet permet de récupérer toutes les données du formulaire
        const formData = new FormData(form);

        // Envoie une requête HTTP POST avec les données du formulaire pour mettre à jour la section
        fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionId}/edit`, {
            method: 'POST',
            body: formData
        })
            .then(async res => {
                // Vérifie si la réponse du serveur est de type JSON
                const contentType = res.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    // Si la réponse est en JSON, on la transforme en un json
                    return res.json();
                } else {
                    // Si la réponse n'est pas en JSON, on affiche une erreur et on lance une exception
                    const text = await res.text();
                    console.error("Erreur : réponse non JSON reçue", text);
                    throw new Error("Réponse non-JSON");
                }
            })
            .then(data => {
                // Si la réponse contient un statut "success", cela signifie que la section a été modifiée avec succès
                // Mise à jour du titre de la section (basé sur l'ID de la section)
                if (data.status === 'success') {
                    const title = document.querySelector(`.section-${data.section_id} .head-section h3`);
                    title.textContent = data.section_nom; // Modifie le titre de la section avec le nouveau nom renvoyé par le serveur
                    closeAllPopups(); // Ferme toutes les popups ouvertes
                } else if (data.status === 'form') {
                    popupContainer.innerHTML = data.html;
                    // Réattache la fonction de soumission du formulaire pour le nouveau formulaire chargé
                    attachEditFormSubmit(sectionId);
                }
            })
            .catch(err => {
                // En cas d'erreur lors de l'envoi du formulaire, afficher un message d'erreur
                console.error("Erreur lors de l'envoi du formulaire :", err);
            });

    });


}

// Supprimer une section

function deleteSection() {
    // Sélectionne les éléments du DOM nécessaires pour afficher la popup et la gestion des événements
    const modal = document.querySelector('.popup-delete-section');
    const backdrop = document.querySelector('.modal-backdrop');
    const cancelBtn = document.querySelector('.cancel-btn-section');
    const confirmBtn = document.querySelector('.confirm-btn-section');

    let sectionToDelete = null; // Variable pour stocker la section à supprimer
    let sectionIdToDelete = null; // Variable pour stocker l'ID de la section à supprimer

    // Ajoute un gestionnaire d'événements à chaque bouton de suppression
    document.querySelectorAll('.delete_section').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            // Identifie la section à supprimer et son ID
            sectionToDelete = btn.closest('.section');
            sectionIdToDelete = btn.dataset.sectionId;

            // Affiche la popup et le fond sombre
            modal.classList.remove('hidden');
            backdrop.classList.remove('hidden');
        });
    });

    // Gestionnaire d'événement pour le bouton "Annuler"
    cancelBtn.addEventListener('click', () => {
        // Cache la popup et le fond lorsque l'utilisateur annule
        modal.classList.add('hidden');
        backdrop.classList.add('hidden');
        // Réinitialise la section et son ID à supprimer
        sectionToDelete = null;
        sectionIdToDelete = null;
    });

    // Gestionnaire d'événement pour le bouton "Confirmer la suppression"
    confirmBtn.addEventListener('click', () => {

        // Si aucune section n'a été sélectionnée pour la suppression, on arrête l'exécution
        if (!sectionIdToDelete) return;

        // Récupère le code de l'UE
        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

        // Envoie une requête DELETE au serveur pour supprimer la section
        fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionIdToDelete}/delete`, {
            method: 'DELETE'
        })
            .then(res => {
                if (!res.ok) {
                    // Si la réponse n'est pas OK (404, 500 etc)
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.status === 'success' && sectionToDelete) {
                    // Supprime la section du DOM
                    sectionToDelete.remove();
                    // Ferme toutes les popups ouvertes
                    closeAllPopups();

                    console.log("section supprimée avec succès");
                } else {
                    console.error("Erreur côté serveur :", data.message || "Erreur inconnue.");
                }

                // Cache la popup et le fond après la suppression
                modal.classList.add('hidden');
                backdrop.classList.add('hidden');
                // Réinitialise les variables
                sectionToDelete = null;
                sectionIdToDelete = null;
            })
            .catch(err => {
                console.error("Erreur AJAX capturée:", err.message);
                // Cache la popup et le fond en cas d'erreur
                modal.classList.add('hidden');
                backdrop.classList.add('hidden');
                // Réinitialise les variables
                sectionToDelete = null;
                sectionIdToDelete = null;
            });

    });

}


// ajouter une publication

function ajouterPublication() {
    // Récupère tous les boutons qui permettent d’ajouter une publication
    const boutonsPublications = document.querySelectorAll("button.add_post");
    // Récupère la popup utilisée pour l’ajout d’une publication
    const popupPublication = document.querySelector("div.popupPublication");


    // Parcourt tous les boutons d’ajout de publication
    boutonsPublications.forEach(button => {
        // Ajoute un gestionnaire d'événement au clic sur chaque bouton
        button.addEventListener("click", function (e) {
            e.stopPropagation();
            // Récupère l’ID de la section liée au bouton cliqué
            const sectionId = this.dataset.sectionId;

            // Stocke l’ID de la section dans un attribut `data-section-id` de la popup, pour pouvoir l’utiliser plus tard
            popupPublication.dataset.sectionId = sectionId;

            // Ouvre la popup d’ajout de publication
            openPopup(popupPublication);

            // Affiche le formulaire par défaut pour ajouter une publication de type "texte"
            // Cette fonction est appelée avec le type "texte" et l’ID de la section

            afficherFormulaire("texte", sectionId)
        });
    });
    // Cache la popup d’ajout de publication
    document.querySelector('div.popupPublication').classList.add('hidden');
}


function afficherFormulaire(type) {

    // Récupère la popup contenant le formulaire d'ajout de publication
    const popupPublication = document.querySelector("div.popupPublication");

    // Récupère l’ID de la section (stockée précédemment dans data-section-id)
    const sectionId = popupPublication.dataset.sectionId;
    console.log(sectionId);
    // Récupère le code de l’UE
    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);
    const url = `/professeur/contenu_ue-${codeUe}/section/${sectionId}/publication/create?type=${type}`;
    console.log(url);

    // Récupère l’élément HTML qui contiendra le contenu HTML du formulaire
    const formulaireContainer = document.querySelector(".formulaireContainer");

    // Envoie une requête POST à Symfony pour obtenir le formulaire à afficher
    fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionId}/publication/create?type=${type}`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'form') {
                // Injecte le HTML du formulaire dans le conteneur prévu
                formulaireContainer.innerHTML = data.html;
                // Initialise la validation côté client pour les fichiers uploadés
                bindUploadValidation();

                // Attache le listener pour la soumission du formulaire
                attachCreatePublicationListener(sectionId);
            }
        })
        .catch(error => {
            console.error("Erreur lors du chargement du formulaire :", error);
        });
}

function attachCreatePublicationListener(sectionId) {

    // Récupère le code de l'UE
    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);

    // Récupère le formulaire de création de publication
    const form = document.querySelector(".create-publication-form");
    if (!form) return;


    // Attache un écouteur sur la soumission du formulaire
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        console.log(document.getElementById('admin-status').value)

        // Crée un objet FormData à partir du formulaire
        const formData = new FormData(form);

        // Ajoute manuellement la valeur de "admin" dans les données envoyées
        formData.append('admin',document.getElementById('admin-status').value )

        for (let [key, value] of formData.entries()) {
            console.log( "formdata : " + key + ': ' + value);
        }
        console.log(form.action);

        // Envoie de la requête POST vers le serveur
        fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionId}/publication/create`, {
            method: "POST",
            body: formData,
        })
            .then(async res => {
                const contentType = res.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    return res.json();
                } else {
                    const text = await res.text();
                    console.error("Erreur : réponse non JSON reçue", text);
                    throw new Error("Réponse non-JSON");
                }
            })
            .then(data => {
                if (data.status === "success") {
                    console.log("valid");

                    console.log(formData);
                    console.log("section id = " + formData.get('publication[section_id]'));
                    console.log("contenu_texte = " + formData.get('publication[contenuTexte]'));
                    // Récupère la section HTML correspondante à l’ID
                    const section = document.querySelector(`.section[data-section-id="${formData.get('publication[section_id]')}"]`);
                    console.log("section = " + section);

                    if (!section) return;
                    // Récupère le conteneur des publications dans la section
                    let postsContainer = section.querySelector('.liste_posts');
                    console.log("postcontainer = " + postsContainer);


                    // Si le container de posts n'existe pas encore (première publication)
                    if (!postsContainer) {
                        postsContainer = document.createElement('div');
                        postsContainer.classList.add('liste_posts');

                        // Supprime le message "Aucune publication..."
                        const noPostMsg = section.querySelector('p');
                        if (noPostMsg) noPostMsg.remove();

                        section.appendChild(postsContainer);

                        // bind le edit de publication
                    }

                    // Crée un élément pour la nouvelle publication
                    const newPost = document.createElement("div");
                    newPost.innerHTML = data.html;

                    // On ajoute la nouvelle publication en haut de la liste
                    postsContainer.append(newPost);

                    // Ferme la popup
                    closeAllPopups();
                    console.log("hi");

                    // rebind des boutons liées aux modifications de publication
                    editPublication();
                    supprimerPublication();
                    epinglement();
                } else if (data.status === "form") {
                    formulaireContainer.innerHTML = data.html;
                    attachCreatePublicationListener(); // Rebind
                }
            });
    });
}

function bindUploadValidation() {
    // Sélectionne le champ input de type fichier
    const fileInput = document.querySelector('input[type="file"][name$="[contenuFichier]"]');

    // Si un tel input est trouvé dans le DOM
    if (fileInput) {
        // Ajoute un écouteur d'événement sur le changement de fichier
        fileInput.addEventListener('change', function(e) {
            // Récupère le premier fichier sélectionné
            const file = e.target.files[0];
            // Si un fichier a bien été sélectionné
            if (file) {
                // Extrait l'extension du fichier, en la mettant en minuscule
                const extension = file.name.split('.').pop().toLowerCase();
                // Définit les extensions autorisées
                const allowedExtensions = ['pdf', 'zip'];

                // Vérifie si l'extension n'est pas dans la liste autorisée
                if (!allowedExtensions.includes(extension)) {
                    alert('Seuls les fichiers ZIP ou PDF sont acceptés.');
                    // Réinitialise le champ fichier pour forcer un nouveau choix
                    e.target.value = '';
                }
            }
        });
    }
}

// editer une publication

function editPublication() {
    // Sélectionne tous les boutons d'édition de publication
    document.querySelectorAll('.edit_post').forEach(button => {
        // Ajoute un écouteur de clic sur chaque bouton
        button.addEventListener('click', function () {
            // Récupère l'URL d'édition depuis l'attribut data-url du bouton
            const url = this.dataset.url;
            console.log(url)
            // Récupère l'ID de la publication depuis l'attribut data-id de l'élément parent `.post`
            const publicationId = this.closest('.post').dataset.id; // On récupère l'ID directement du DOM
            console.log("Publication ID :", publicationId);

            // Effectue une requête GET pour récupérer le formulaire d'édition
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'form') {
                        // Injecte le HTML du formulaire dans le conteneur prévu
                        document.getElementById('edit-publication-form-container').innerHTML = data.html;
                        // Affiche la modale d'édition
                        document.getElementById('editPublicationModal').style.display = 'flex';
                        // Affiche l’arrière-plan de la modale
                        document.querySelector('.modal-backdrop').classList.remove('hidden');
                        // Ajoute un événement pour fermer la modale si on clique sur l’arrière-plan
                        document.querySelector('.modal-backdrop').addEventListener('click', function() {
                            this.classList.add('hidden');
                            document.getElementById('editPublicationModal').style.display = 'none';
                        })
                        // Active les toggles du formulaire
                        inputToggleEditPost();
                        // Active le listener de soumission pour le formulaire d'édition
                        attachEditPublicationFormListener(publicationId); // on passe bien l'id ici
                    }
                })
                .catch(error => {
                    // Gère les erreurs réseau ou serveur
                    console.error('Erreur AJAX :', error);
                });
        });
    });

// Fermer la modal
// document.querySelector('.close-btn').addEventListener('click', function () {
//     document.getElementById('editPublicationModal').style.display = 'none';
// });

}

function inputToggleEditPost() {
    console.log("heyyyyyyyy");

    // Récupère le champ <select> permettant de choisir le type de publication
    const selectType = document.querySelector('#publication_type_publication_id.editHelp');
    // Récupère la ligne contenant le champ de texte
    const contenuTexteRow = document.getElementById('contenuTexteRow');
    // Récupère la ligne contenant le champ de fichier
    const contenuFichierRow = document.getElementById('contenuFichierRow');

    console.log("résultat = " + selectType.value);

    // Fonction qui affiche/masque les champs selon la valeur sélectionnée
    function toggleContenuFields() {
        if (selectType.value === '2') {
            contenuTexteRow.style.display = 'none';
            contenuFichierRow.style.display = 'block';
        } else {
            contenuTexteRow.style.display = 'block';
            contenuFichierRow.style.display = 'none';
        }
    }

// On appelle la fonction au chargement
    toggleContenuFields();

// Et à chaque changement du select
    selectType.addEventListener('change', toggleContenuFields);
}



function attachEditPublicationFormListener(publicationId) {
    // Sélectionne le formulaire d'édition par son ID
    const form = document.querySelector('#edit-publication-form');

    // Si le formulaire n'existe pas, on sort
    if (!form) return;

    // Écoute l'événement de soumission du formulaire
    form.addEventListener('submit', function (e) {
        e.preventDefault();
// Récupère les données du formulaire
        const formData = new FormData(form);
        for (const value of formData.values()) {
            console.log(value);
        }
        const action = form.action;
        console.log("voici le action : " + action);

        // Récupère le code de l'UE
        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

        // Envoie des données au serveur via `fetch` vers l'URL prévue pour l'édition
        fetch(`/professeur/contenu_ue-${codeUe}/section/1/publication/${publicationId}/edit`, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Ferme la modal d'édition
                    document.getElementById('editPublicationModal').style.display = 'none';
                    document.querySelector('.modal-backdrop').classList.add('hidden');

                    // Trouve l'élément DOM de la publication mise à jour
                    const postDiv = document.querySelector(`.post[data-id="${data.id}"]`);
                    if (!postDiv) return;

                    // Met à jour titre, date
                    postDiv.querySelector('.title_post').textContent = data.titre;
                    postDiv.querySelector('.date_post').textContent = data.derniere_modif;

                    // Mise à jour contenu
                    const textPost = postDiv.querySelector('.text_post');
                    const nomFichier = postDiv.querySelector('.nom_fichier');
                    const downloadPost = postDiv.querySelector('div.download > a')


                    // Si la publication est un fichier
                    if (data.type_publication_id === 2 && nomFichier) {
                        nomFichier.textContent = data.contenu_fichier;
                        downloadPost.setAttribute('href', '../uploads/' + data.contenu_fichier);
                        // Sinon c'est un texte
                    } else if (textPost) {
                        textPost.textContent = data.contenu_texte;
                    }

                    // Mettre à jour les classes
                    postDiv.className = 'post'; // reset
                    console.log('Données reçues après édition :', data); // 👈 vérifie ici
                    if (data.type_publication_id === 2) postDiv.classList.add('file');
                    else if (data.type_publication_id === 3) postDiv.classList.add('calendar');
                    else if (data.type_publication_id === 4) postDiv.classList.add('warning');
                    else if (data.type_publication_id === 5) postDiv.classList.add('info');

                    // Ajout visuel
                    postDiv.style.transition = 'background-color 0.5s';
                    postDiv.style.backgroundColor = '#fff1a8';
                    setTimeout(() => {
                        postDiv.style.backgroundColor = '';
                    }, 1000);


                } else if (data.status === 'form') {
                    // Si le serveur renvoie à nouveau un formulaire
                    document.getElementById('edit-publication-form-container').innerHTML = data.html;
                    attachEditPublicationFormListener();
                }
            })
            .catch(error => {
                console.error('Erreur AJAX :', error);
            });
    });
}

// supprimer une publication

function supprimerPublication() {

    // Références aux éléments de la popup de suppression
    const modal_post = document.querySelector('.popup-delete-publication');
    const backdrop_post = document.querySelector('.modal-backdrop');
    const cancelBtn_post = document.querySelector('.cancel-btn-post');
    const confirmBtn_post = document.querySelector('.confirm-btn-post');

    // Variables pour stocker temporairement les éléments à supprimer
    let sectionToDeleteForPublication = null;
    let sectionIdToDeleteForPublication = null;

    let publicationToDelete = null;
    let publicationIdToDelete = null;

    // Ajoute un gestionnaire d'événements à chaque bouton de suppression de publication
    document.querySelectorAll('.delete_post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Récupère la section et son ID contenant le post à supprimer
            sectionToDeleteForPublication = btn.closest('.section');
            sectionIdToDeleteForPublication = sectionToDeleteForPublication.dataset.sectionId;
            console.log("id de la section" + sectionIdToDeleteForPublication);
            // Récupère l'élément DOM du post et son ID
            publicationToDelete = btn.closest('.post');
            publicationIdToDelete = btn.dataset.publicationId;
            console.log("id du post" + publicationIdToDelete);

            // Affiche la popup de confirmation
            modal_post.classList.remove('hidden');
            backdrop_post.classList.remove('hidden');
        });
    });

    // Gestion du bouton "Annuler" : ferme la popup et réinitialise les variables
    cancelBtn_post.addEventListener('click', () => {
        modal_post.classList.add('hidden');
        backdrop_post.classList.add('hidden');

        // Réinitialisation des variables
        sectionToDeleteForPublication = null;
        sectionIdToDeleteForPublication = null;
        publicationToDelete = null;
        publicationIdToDelete = null;
    });

    // Gestion du bouton "Confirmer" : envoie une requête pour supprimer la publication
    confirmBtn_post.addEventListener('click', () => {
        if (!publicationIdToDelete) return;

        // Récupère le code de l'UE
        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

        // Envoie une requête AJAX GET pour supprimer la publication
        fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionIdToDeleteForPublication}/publication/${publicationIdToDelete}/delete`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log("ici");
                if (data.status === 'success' && publicationToDelete) {
                    // Supprime l'élément DOM de la publication
                    publicationToDelete.remove();
                    console.log("publication supprimée avec succès")
                }

                // Ferme la popup et réinitialise les variables
                modal_post.classList.add('hidden');
                backdrop_post.classList.add('hidden');
                sectionToDeleteForPublication = null;
                sectionIdToDeleteForPublication = null;
                publicationToDelete = null;
                publicationIdToDelete = null;
            })
            .catch(err => {
                console.log("par la");

                console.error("Erreur AJAX :", err);
            });
    });
}

function epinglement() {


    // Sélection de tous les boutons d’épinglage présents sur la page
    document.querySelectorAll('.epingle_post').forEach(button => {
        // Ajout d'un événement au clic sur chaque bouton
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Récupération du code UE
            const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
            console.log(codeUe);

            // Récupération de l'ID de la publication à épingler
            const publicationId = this.dataset.publicationId;

            // Requête AJAX POST pour épingler la publication
            return fetch(`/professeur/contenu_ue-${codeUe}/publication/` + publicationId + '/epingle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest', // important pour reconnaître que c'est AJAX côté Symfony
                },
                body: JSON.stringify({
                    publicationId: publicationId
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('Publication épinglée !');

                        // Récupération et duplication du post à épingler
                        const post = button.closest('.post');
                        const post_copy = post.cloneNode(true);

                        // Si des données de l’utilisateur sont renvoyées (nom, prénom), on les affiche
                        if(data.data){
                            console.log('DATA');
                            console.log(data.data)
                            const span_title = document.createElement("span")
                            span_title.classList.add('auteur');
                            span_title.innerHTML = `Epinglé par : ${data.data.nom} ${data.data.prenom}`;
                            post_copy.querySelector('.top_post').appendChild(span_title);
                        } else {
                            console.log("pas data");
                        }

                        //                                    <span class="auteur"></span>
                        const epinglesContainer = document.querySelector('.publications-epingles');


                        // on recupere egalement les boutons d'edit et de suppression pour pouvoir les suppriemr
                        const editButton = post_copy.querySelector("button.edit_post");
                        const deleteButton = post_copy.querySelector("button.delete_post");
                        const epingleButton = post_copy.querySelector("button.epingle_post");

                        // on recupere le bouton de epingle du vrai post pour le desafficher
                        const epingleButtonOriginal = post.querySelector("button.epingle_post");

                        if (post && epinglesContainer) {
                            // Déplacer le post dans la partie épinglés
                            epinglesContainer.appendChild(post_copy);

                            // Remplacer le bouton "épingler" par "désépingler"
                            epingleButton.classList.remove('epingle_post');
                            epingleButton.classList.add('desepingle_post');
                            button.innerHTML = '<i class="fa-solid fa-thumbtack"></i>';
                            // Suppression des boutons inutiles sur le post épinglé
                            editButton.remove();
                            deleteButton.remove();
                            epingleButtonOriginal.remove();
                        }
                    } else {
                        alert('Erreur lors de l\'épinglage.');
                    }
                })

        });
        // Ajout d’un seul écouteur global pour tous les boutons "désépingler"
        if (!window.desepingleListenerAdded) {
            document.addEventListener('click', function(e) {
                if (e.target.closest('.desepingle_post')) {
                    e.preventDefault();
                    const codeUe = document.querySelector('span.code').innerHTML;
                    console.log(codeUe);

                    const button = e.target.closest('.desepingle_post');
                    const publicationId = button.dataset.publicationId;

                    // Requête AJAX pour désépingler une publication
                    fetch(`/professeur/contenu_ue-${codeUe}/publication/` + publicationId + '/desepingle', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: JSON.stringify({
                            publicationId: publicationId
                        })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'success') {
                                alert('Publication désépinglée !');
                                // Trouver le post désépinglé dans la zone "épinglés"
                                const desepingleButton = e.target.closest('.desepingle_post');
                                const epinglePost = desepingleButton.closest('.post');
                                const publicationId = epinglePost.getAttribute('data-id');

                                if (epinglePost) {
                                    // Retrouver le post original dans la section principale
                                    const originalPost = document.querySelector('.sections-wrapper .post[data-id="' + publicationId + '"]');

                                    if (originalPost) {
                                        // trouver l'interactions_post de ce post
                                        const interactions = originalPost.querySelector('.interactions_post');

                                        if (interactions) {
                                            // vérifier si le bouton epingle existe déjà (éviter les doublons)
                                            let existingEpingleButton = interactions.querySelector('.epingle_post');
                                            if (!existingEpingleButton) {
                                                // recréer le bouton epingle
                                                const newEpingleButton = document.createElement('button');
                                                newEpingleButton.classList.add('epingle_post');
                                                newEpingleButton.setAttribute('data-publication-id', publicationId);
                                                newEpingleButton.innerHTML = '<i class="fa-solid fa-thumbtack"></i>';

                                                interactions.appendChild(newEpingleButton);

                                                // re-binder l'event listener sur ce nouveau bouton
                                                rebindAllEpinglePostButtons();
                                                originalPost.querySelector(".epingle_post").style.display = 'inline';
                                            }
                                        }
                                    }

                                    // supprimer l'élément de la liste des épinglés
                                    epinglePost.remove();
                                }
                            } else {
                                alert('Erreur lors du désépinglage.');
                            }
                        });

                }
            });

            // Marque que l'event listener a été ajouté
            window.desepingleListenerAdded = true;
        }

    });

    // Fonction pour re-binder les boutons épingler après mise à jour du DOM
    function rebindAllEpinglePostButtons() {
// D'abord, on enlève tous les anciens event listeners (en recréant les boutons)
        document.querySelectorAll('.epingle_post').forEach(oldButton => {
            const newButton = oldButton.cloneNode(true);
            oldButton.parentNode.replaceChild(newButton, oldButton);
        });

// Maintenant, on rebinde proprement tous les boutons
        document.querySelectorAll('.epingle_post').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                const codeUe = document.querySelector('span.code').innerHTML;
                const publicationId = this.dataset.publicationId;

                fetch(`/professeur/contenu_ue-${codeUe}/publication/${publicationId}/epingle`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: JSON.stringify({ publicationId: publicationId })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            alert('Publication épinglée !');

                            const post = button.closest('.post');
                            const postCopy = post.cloneNode(true);
                            const epinglesContainer = document.querySelector('.publications-epingles');

                            // Supprimer les boutons edit/delete du post copié
                            const editButton = postCopy.querySelector("button.edit_post");
                            const deleteButton = postCopy.querySelector("button.delete_post");
                            if (editButton) editButton.remove();
                            if (deleteButton) deleteButton.remove();

                            if (epinglesContainer) {
                                epinglesContainer.appendChild(postCopy);
                            }

                            // Transformer le bouton actuel en bouton désépingler
                            button.classList.remove('epingle_post');
                            button.classList.add('desepingle_post');
                            button.innerHTML = '<i class="fa-solid fa-thumbtack"></i>';

                            // Pas besoin de rebind ici car les désépingles sont écoutés globalement
                        } else {
                            alert('Erreur lors de l\'épinglage.');
                        }
                    })
                    .catch(error => {
                        console.error('Erreur:', error);
                    });
            });
        });
    }
}
