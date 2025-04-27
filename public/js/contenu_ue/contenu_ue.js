
function reloadAll() {
        const darkBackground = document.querySelector("div.darkBackground");
        const popupPublication = document.querySelector("div.popupPublication");
        const popupListeUsers = document.querySelector("div.popUpListe");
        const popupAddSection = document.querySelector("div.popupAddSection");
        const allPopups = document.querySelectorAll(".popup");

        const boutonsPublications = document.querySelectorAll("button.add_post");
        const boutonSection = document.querySelector("button.add_section");
        const buttonStatsEleves = document.querySelector("div.statistiques-section.eleves");
        const buttonStatsProfesseurs = document.querySelector("div.statistiques-section.professeurs");

        const formulaireContainer = document.querySelector(".formulaireContainer");
        const switchBg = document.querySelector(".switch-background");
        const boutonText = document.querySelector(".boutonsSwitch .text");
        const boutonFile = document.querySelector(".boutonsSwitch .file");

        const switchBgListe = document.querySelector(".switch-background-liste");
        const boutonStudent = document.querySelector(".boutonsSwitchListes .student");
        const boutonTeacher = document.querySelector(".boutonsSwitchListes .teacher");
        const containerListe = document.querySelector(".containerListe");

        const listeData = document.getElementById("liste-data");
        const eleves = JSON.parse(listeData.dataset.eleves);
        const profs = JSON.parse(listeData.dataset.profs);

        // ----- OUTILS GENERIQUES POUR POPUPS -----

        function openPopup(popup) {
            closeAllPopups();
            popup.classList.remove("hidden");
            darkBackground.classList.remove("hidden");
            boutonText.style.color = "white";
        }

        function closeAllPopups() {
            allPopups.forEach(p => p.classList.add("hidden"));
            darkBackground.classList.add("hidden");
        }

        document.addEventListener("click", function (e) {
            if (![...allPopups].some(popup => popup.contains(e.target)) &&
                !e.target.closest("button.add_post") &&
                !e.target.closest(".statistiques-section")) {
                closeAllPopups();
            }
        });

        boutonSection.addEventListener("click", function (e) {
            e.stopPropagation();
            console.log("click fait");
            console.log(popupAddSection);
            openPopup(popupAddSection);
        });

        // ----- POPUP CREATION PUBLICATION -----



        boutonsPublications.forEach(button => {
            button.addEventListener("click", function (e) {
                e.stopPropagation();
                const sectionId = this.dataset.sectionId;

                // Stocke l'ID quelque part, dans un champ caché par exemple
                popupPublication.dataset.sectionId = sectionId;

                openPopup(popupPublication);
                afficherFormulaire("texte", sectionId)
            });
        });

    function afficherFormulaire(type) {
        const sectionId = popupPublication.dataset.sectionId;
        console.log(sectionId);
        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);
        const url = `/professeur/contenu_ue-${codeUe}/section/${sectionId}/publication/create?type=${type}`;
        console.log(url);

        fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionId}/publication/create?type=${type}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'form') {
                    formulaireContainer.innerHTML = data.html;
                    attachCreatePublicationListener(sectionId); // écoute le submit
                }
            })
            .catch(error => {
                console.error("Erreur lors du chargement du formulaire :", error);
            });
    }

    function attachCreatePublicationListener(sectionId) {

        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

        const form = document.querySelector(".create-publication-form");
        if (!form) return;

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = new FormData(form);
            console.log(form.action);

            // c ici le probleme brotha

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
                        console.log(formData.get('publication[section_id]'));
                        const section = document.querySelector(`.section[data-section-id="${formData.get('publication[section_id]')}"]`);
                        console.log(section);

                        if (!section) return;

                        let postsContainer = section.querySelector('.liste_posts');

                        // Si le container de posts n'existe pas encore (première publication)
                        if (!postsContainer) {
                            postsContainer = document.createElement('div');
                            postsContainer.classList.add('liste_posts');

                            // Supprime le message "Aucune publication..."
                            const noPostMsg = section.querySelector('p');
                            if (noPostMsg) noPostMsg.remove();

                            section.appendChild(postsContainer);
                        }

                        const newPost = document.createElement("div");
                        newPost.innerHTML = data.html;

                        // On ajoute la nouvelle publication en haut de la liste
                        postsContainer.prepend(newPost.firstElementChild);

                        // Ferme la popup
                        closeAllPopups();
                        reloadAll();
                    } else if (data.status === "form") {
                        console.log("no valid");
                        formulaireContainer.innerHTML = data.html;
                        attachCreatePublicationListener(); // Rebind
                    }
                });
        });
    }



    boutonText.addEventListener("click", () => {
            switchBg.style.left = "0%";
            boutonText.style.color = "white";
            boutonFile.style.color = "black";
            afficherFormulaire("texte");
        });

        boutonFile.addEventListener("click", () => {
            switchBg.style.left = "50%";
            boutonText.style.color = "black";
            boutonFile.style.color = "white";
            afficherFormulaire("fichier");
            dropZoneLoaded();
        });

        afficherFormulaire("texte");

        // ----- POPUP LISTE USERS -----

        function afficherListeUser(type) {
            const data = type === "student" ? eleves : profs;
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
            </div>`).join("");

            containerListe.innerHTML = `<div class="${type === "student" ? "liste-etudiants" : "liste-professeurs"}">${html}</div>`;
        }

        boutonStudent.addEventListener("click", () => {
            switchBgListe.style.left = "0%";
            boutonStudent.style.color = "white";
            boutonTeacher.style.color = "black";
            afficherListeUser("student");
        });

        boutonTeacher.addEventListener("click", () => {
            switchBgListe.style.left = "50%";
            boutonStudent.style.color = "black";
            boutonTeacher.style.color = "white";
            afficherListeUser("teacher");
        });

        buttonStatsEleves.addEventListener("click", () => {
            openPopup(popupListeUsers);
            switchBgListe.style.left = "0%";
            boutonStudent.style.color = "white";
            boutonTeacher.style.color = "black";
            afficherListeUser("student");
        });

        buttonStatsProfesseurs.addEventListener("click", () => {
            openPopup(popupListeUsers);
            switchBgListe.style.left = "50%";
            boutonStudent.style.color = "black";
            boutonTeacher.style.color = "white";
            afficherListeUser("teacher");
        });



        // ----- MENU OPTIONS (les 3 points) -----

        document.querySelectorAll(".top_post").forEach(post => {
            const ellipsis = post.querySelector(".ellipsis_icon");
            const optionsMenu = post.querySelector(".options_menu");

            ellipsis.addEventListener("click", function (event) {
                event.stopPropagation();
                document.querySelectorAll(".options_menu").forEach(menu => {
                    if (menu !== optionsMenu) menu.style.display = "none";
                });
                optionsMenu.style.display = optionsMenu.style.display === "block" ? "none" : "block";
            });
        });

        document.addEventListener("click", function () {
            document.querySelectorAll(".options_menu").forEach(menu => {
                menu.style.display = "none";
            });
        });

    const popupContainer = document.querySelector('.popupEditSectionContainer');
    const background = document.querySelector('.darkBackground');

    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);

    // Ouvrir la popup de modification de la section
    document.querySelectorAll('.edit_section').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionDiv = btn.closest('.section');
            const sectionId = sectionDiv.classList[1].split('-')[1];

            fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionId}/edit`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'form') {
                        popupContainer.innerHTML = data.html;
                        popupContainer.classList.remove('hidden');
                        background.classList.remove('hidden');
                        attachEditFormSubmit(sectionId);
                    }
                });

        });
    });

    // Gérer la soumission du formulaire de modification
    function attachEditFormSubmit(sectionId) {
        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);
        const form = document.querySelector('.edit-section-form');
        form.addEventListener('submit', e => {
            e.preventDefault();

            const formData = new FormData(form);

            fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionId}/edit`, {
                method: 'POST',
                body: formData
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

                    if (data.status === 'success') {
                        const title = document.querySelector(`.section-${data.section_id} .head-section h3`);
                        title.textContent = data.section_nom;
                        popupContainer.classList.add('hidden');
                        background.classList.add('hidden');
                    } else if (data.status === 'form') {
                        popupContainer.innerHTML = data.html;
                        attachEditFormSubmit(sectionId);
                    }
                })
                .catch(err => {
                    console.error("Erreur lors de l'envoi du formulaire :", err);
                });

        });


    }

    // Fermer la popup si on clique sur le fond sombre
    document.addEventListener('click', () => {
        popupContainer.classList.add('hidden');
        background.classList.add('hidden');
    });

    // Supprimer une section

    const modal = document.querySelector('.custom-modal');
    const backdrop = document.querySelector('.modal-backdrop');
    const cancelBtn = document.querySelector('.cancel-btn');
    const confirmBtn = document.querySelector('.confirm-btn');

    let sectionToDelete = null;
    let sectionIdToDelete = null;

    document.querySelectorAll('.delete_section').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            sectionToDelete = btn.closest('.section');
            sectionIdToDelete = btn.dataset.sectionId;

            modal.classList.remove('hidden');
            backdrop.classList.remove('hidden');
        });
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        backdrop.classList.add('hidden');
        sectionToDelete = null;
        sectionIdToDelete = null;
    });


    confirmBtn.addEventListener('click', () => {
        if (!sectionIdToDelete) return;

        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

        fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionIdToDelete}/delete`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && sectionToDelete) {
                    sectionToDelete.remove();
                    console.log("section supprimée avec succès")
                } else {
                    alert("Erreur lors de la suppression.");
                }

                modal.classList.add('hidden');
                backdrop.classList.add('hidden');
                sectionToDelete = null;
                sectionIdToDelete = null;
            })
            .catch(err => {
                console.error("Erreur AJAX :", err);
            });
    });



    // supprimer un post

    const modal_post = document.querySelector('.custom-modal-post');
    const backdrop_post = document.querySelector('.modal-backdrop');
    const cancelBtn_post = document.querySelector('.custom-modal-post .cancel-btn');
    const confirmBtn_post = document.querySelector('.custom-modal-post .confirm-btn');

    let sectionToDeleteForPublication = null;
    let sectionIdToDeleteForPublication = null;

    let publicationToDelete = null;
    let publicationIdToDelete = null;

    document.querySelectorAll('.delete_post').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            sectionToDeleteForPublication = btn.closest('.section');
            sectionIdToDeleteForPublication = sectionToDeleteForPublication.dataset.sectionId;
            console.log("id de la section" + sectionIdToDeleteForPublication);
            publicationToDelete = btn.closest('.post');
            publicationIdToDelete = btn.dataset.publicationId;
            console.log("id du post" + publicationIdToDelete);


            modal_post.classList.remove('hidden');
            backdrop_post.classList.remove('hidden');
        });
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        backdrop.classList.add('hidden');
        sectionToDelete = null;
        sectionIdToDelete = null;
    });

    confirmBtn.addEventListener('click', () => {
        if (!sectionIdToDelete) return;

        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

        fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionIdToDelete}/delete`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && publicationToDelete) {
                    publicationToDelete.remove();
                    console.log("pubblication supprimée avec succès")
                } else {
                    alert("Erreur lors de la suppression.");
                }

                modal.classList.add('hidden');
                backdrop.classList.add('hidden');
                sectionToDelete = null;
                sectionIdToDelete = null;
            })
            .catch(err => {
                console.error("Erreur AJAX :", err);
            });
    });


    cancelBtn_post.addEventListener('click', () => {
        modal_post.classList.add('hidden');
        backdrop_post.classList.add('hidden');
        sectionToDeleteForPublication = null;
        sectionIdToDeleteForPublication = null;
        publicationToDelete = null;
        publicationIdToDelete = null;
    });


    confirmBtn_post.addEventListener('click', () => {
        if (!publicationIdToDelete) return;

        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

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
                    publicationToDelete.remove();
                    console.log("publication supprimée avec succès")
                }

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

    // editer un post

    document.querySelectorAll('.edit_post').forEach(button => {
        button.addEventListener('click', function () {
            const url = this.dataset.url;
            const publicationId = this.closest('.post').dataset.id; // On récupère l'ID directement du DOM
            console.log("Publication ID :", publicationId);

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'form') {
                        document.getElementById('edit-publication-form-container').innerHTML = data.html;
                        document.getElementById('editPublicationModal').style.display = 'flex';
                        attachEditPublicationFormListener(publicationId); // on passe bien l'id ici
                    }
                })
                .catch(error => {
                    console.error('Erreur AJAX :', error);
                });
        });
    });

    // Fermer la modal
    document.querySelector('.close-btn').addEventListener('click', function () {
        document.getElementById('editPublicationModal').style.display = 'none';
    });

}




document.addEventListener("DOMContentLoaded", function () {
    reloadAll();
})

// Ajotuer le create dans la bonne popup


document.addEventListener('DOMContentLoaded', () => {
    const popupContainer = document.querySelector('.popupAddSection');
    const background = document.querySelector('.darkBackground');

    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);

    // Ouvrir la popup de création
    document.querySelector('.add_section').addEventListener('click', () => {
    console.log(document.querySelector('.add_section'));
            fetch(`/professeur/contenu_ue-${codeUe}/section/create`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'form') {
                        popupContainer.innerHTML = data.html;
                        popupContainer.classList.remove('hidden');
                        background.classList.remove('hidden');
                        attachCreateFormSubmit();
                    }
                });

        });
    });

    // Gérer la soumission du formulaire de modification
function attachCreateFormSubmit() {
    const form = document.querySelector('.create-section-form');

    const popupContainer = document.querySelector('.popupAddSection');
    const background = document.querySelector('.darkBackground');

    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();

        const formData = new FormData(form);

        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

        fetch(`/professeur/contenu_ue-${codeUe}/section/create`, {
            method: 'POST',
            body: formData
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
                if (data.status === 'success') {
                    // Créer un élément DOM à partir du HTML retourné par Symfony
                    const sectionContainer = document.querySelector('.sections-wrapper'); // ou l'endroit où tu veux insérer
                    console.log("voici le container : " + sectionContainer);
                    console.log(data);
                    const temp = document.createElement('div');
                    temp.innerHTML = data.html;
                    console.log("HTML reçu :", data.html);
                    const newSection = temp.firstElementChild;
                    console.log("HTML reçu :", data.html);

                    sectionContainer.appendChild(newSection);

                    reloadAll();

                    // Fermer la popup
                    popupContainer.classList.add('hidden');
                    background.classList.add('hidden');
                } else if (data.status === 'form') {
                    popupContainer.innerHTML = data.html;
                    attachCreateFormSubmit(); // Réattacher car le DOM a été remplacé
                }
            })
            .catch(err => {
                console.error("Erreur lors de l'envoi du formulaire :", err);
            });
    });


}





function attachEditPublicationFormListener(publicationId) {
    const form = document.querySelector('#edit-publication-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        for (const value of formData.values()) {
            console.log(value);
        }
        const action = form.action;
        console.log("voici le action : " + action);


        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

        fetch(`/professeur/contenu_ue-${codeUe}/section/1/publication/${publicationId}/edit`, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    document.getElementById('editPublicationModal').style.display = 'none';

                    const postDiv = document.querySelector(`.post[data-id="${data.id}"]`);
                    if (!postDiv) return;

                    // Met à jour titre, date
                    postDiv.querySelector('.title_post').textContent = data.titre;
                    postDiv.querySelector('.date_post').textContent = data.derniere_modif;

                    // Mise à jour contenu
                    const textPost = postDiv.querySelector('.text_post');
                    const nomFichier = postDiv.querySelector('.nom_fichier');
                    const downloadPost = postDiv.querySelector('div.download > a')

                    if (data.type_publication_id === 2 && nomFichier) {
                        nomFichier.textContent = data.contenu_fichier;
                        downloadPost.setAttribute('href', '../uploads/' + data.contenu_fichier);

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

                    // Ajout visuel temporaire (ex: animation highlight)
                    postDiv.style.transition = 'background-color 0.5s';
                    postDiv.style.backgroundColor = '#fff1a8';
                    setTimeout(() => {
                        postDiv.style.backgroundColor = '';
                    }, 1000);

                } else if (data.status === 'form') {
                    document.getElementById('edit-publication-form-container').innerHTML = data.html;
                    attachEditPublicationFormListener();
                }
            })
            .catch(error => {
                console.error('Erreur AJAX :', error);
            });
    });
}

document.querySelectorAll('.epingle_post').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();

        const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
        console.log(codeUe);

        const publicationId = this.dataset.publicationId;

        fetch(`/professeur/contenu_ue-${codeUe}/publication/` + publicationId + '/epingle', {
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
                    // Tu peux aussi faire un reload partiel ou changer l'icône visuellement
                } else {
                    alert('Erreur lors de l\'épinglage.');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
            });
    });
    document.addEventListener('click', function(e) {
        if (e.target.closest('.desepingle_post')) {
            e.preventDefault();
            const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
            console.log(codeUe);

            const button = e.target.closest('.desepingle_post');
            const publicationId = button.dataset.publicationId;

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
                        // alert('Publication désépinglée !'); pour linstnat en comme car reload infini
                        // Exemple : supprimer visuellement
                        // button.closest('.publication-card').remove();
                    } else {
                        alert('Erreur lors du désépinglage.');
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                });
        }
    });

});





// Code pour la dropzone du file input :

function dropZoneLoaded() {
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");

        dropZoneElement.addEventListener("click", (e) => {
            inputElement.click();
        });

        inputElement.addEventListener("change", (e) => {
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
        });

        dropZoneElement.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
        });

        ["dragleave", "dragend"].forEach((type) => {
            dropZoneElement.addEventListener(type, (e) => {
                dropZoneElement.classList.remove("drop-zone--over");
            });
        });

        dropZoneElement.addEventListener("drop", (e) => {
            e.preventDefault();

            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }

            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    /**
     * Updates the thumbnail on a drop zone element.
     *
     * @param {HTMLElement} dropZoneElement
     * @param {File} file
     */
    function updateThumbnail(dropZoneElement, file) {
        let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

        // First time - remove the prompt
        if (dropZoneElement.querySelector(".drop-zone__prompt")) {
            dropZoneElement.querySelector(".drop-zone__prompt").remove();
            dropZoneElement.querySelector("div.separator").remove();
            dropZoneElement.querySelector("div.fake-button").remove();
        }

        // First time - there is no thumbnail element, so lets create it
        if (!thumbnailElement) {
            thumbnailElement = document.createElement("div");
            thumbnailElement.classList.add("drop-zone__thumb");
            dropZoneElement.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = file.name;

        // Show thumbnail for image files
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
            };
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
    }




}