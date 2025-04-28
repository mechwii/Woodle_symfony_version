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
    const popupListeUsers = document.querySelector("div.popUpListe");
    const popupAddSection = document.querySelector("div.popupAddSection");

    const boutonSection = document.querySelector("button.add_section");
    const buttonStatsEleves = document.querySelector("div.statistiques-section.eleves");
    const buttonStatsProfesseurs = document.querySelector("div.statistiques-section.professeurs");


    const switchBgListe = document.querySelector(".switch-background-liste");
    const boutonStudent = document.querySelector(".boutonsSwitchListes .student");
    const boutonTeacher = document.querySelector(".boutonsSwitchListes .teacher");

    const listeData = document.getElementById("liste-data");



    boutonStudent.addEventListener("click", () => {
        switchBgListe.style.left = "0%";
        boutonStudent.style.color = "white";
        boutonTeacher.style.color = "black";
        afficherListeUser("student", listeData);
    });

    boutonTeacher.addEventListener("click", () => {
        switchBgListe.style.left = "50%";
        boutonStudent.style.color = "black";
        boutonTeacher.style.color = "white";
        afficherListeUser("teacher", listeData);
    });

    buttonStatsEleves.addEventListener("click", () => {
        openPopup(popupListeUsers);
        switchBgListe.style.left = "0%";
        boutonStudent.style.color = "white";
        boutonTeacher.style.color = "black";
        afficherListeUser("student", listeData);
    });

    buttonStatsProfesseurs.addEventListener("click", () => {
        openPopup(popupListeUsers);
        switchBgListe.style.left = "50%";
        boutonStudent.style.color = "black";
        boutonTeacher.style.color = "white";
        afficherListeUser("teacher", listeData);
    });
}

// ----- OUTILS GENERIQUES POUR POPUPS -----

function openPopup(popup) {
    closeAllPopups();

    const switchBg = document.querySelector(".switch-background");
    const boutonText = document.querySelector(".boutonsSwitch .text");
    const boutonFile = document.querySelector(".boutonsSwitch .file");
    const darkBackground = document.querySelector("div.darkBackground");

    darkBackground.addEventListener('click', function (){
        darkBackground.classList.add('hidden');
        document.querySelector('div.popupPublication').classList.add('hidden');
    })


    switchBg.style.left = "0%";
    boutonText.style.color = "white";
    boutonFile.style.color = "black";
    popup.classList.remove("hidden");
    darkBackground.classList.remove("hidden");
    boutonText.style.color = "white";

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
    });
}

function closeAllPopups() {
    const darkBackground = document.querySelector("div.darkBackground");
    const allPopups = document.querySelectorAll(".popup");

    allPopups.forEach(p => p.classList.add("hidden"));
    darkBackground.classList.add("hidden");
    const confirmBtn_post = document.querySelector('.confirm-btn-post');

    if(confirmBtn_post){
        confirmBtn_post.removeEventListener('click', () => {
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
        })
    }

    const confirmBtn = document.querySelector('.confirm-btn-section');

    if(confirmBtn){
        confirmBtn.removeEventListener('click', () => {

            if (!sectionIdToDelete) return;

            const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
            console.log(codeUe);

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
                        sectionToDelete.remove();
                        console.log("section supprimée avec succès");
                    } else {
                        console.error("Erreur côté serveur :", data.message || "Erreur inconnue.");
                    }

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

function afficherListeUser(type, listeData) {

    const eleves = JSON.parse(listeData.dataset.eleves);
    const profs = JSON.parse(listeData.dataset.profs);

    const containerListe = document.querySelector(".containerListe");


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

    document.querySelector("div.darkBackground").addEventListener('click', function () {
        closeAllPopups();
    })
}

// Fonction pour ajouter une section

// Ajotuer le create dans la bonne popup

function ajouterSection() {
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

                    background.addEventListener('click', function () {
                        background.classList.add('hidden');
                        popupContainer.classList.add('hidden');
                    } )
                    attachCreateFormSubmit();
                }
            });

    });
    background.classList.add('hidden');
    document.querySelector('.popupAddSection').classList.add('hidden');
}




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
                    const sectionContainer = document.querySelector('.sections-wrapper');
                    const temp = document.createElement('div');
                    temp.innerHTML = data.html;

                    const newSection = temp.firstElementChild;

                    // ➡️ Trouver l'ID à partir de la classe .section-XX
                    const classList = Array.from(newSection.classList);
                    const sectionClass = classList.find(cls => cls.startsWith('section-'));

                    if (sectionClass) {
                        const sectionId = sectionClass.split('-')[1];
                        newSection.setAttribute('data-section-id', sectionId);
                        console.log('Section ID attribué :', sectionId);
                    }

                    sectionContainer.appendChild(newSection);

                    // ici fonction de rebind pour edit
                    bindEditSectionButtons();

                    //ici fonciton de bind pour suppr
                    deleteSection();

                    //ici bind pour ajt
                    ajouterPublication();

                    popupContainer.classList.add('hidden');
                    background.classList.add('hidden');
                } else if (data.status === 'form') {
                    popupContainer.innerHTML = data.html;
                    attachCreateFormSubmit();
                }
            })

    });

}

// editer une section
function editSection() {


    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);

// Ouvrir la popup de modification de la section
    bindEditSectionButtons();

}

function bindEditSectionButtons() {

    const popupContainer = document.querySelector('.popupEditSectionContainer');
    const background = document.querySelector('.darkBackground');

    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);

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
                        background.addEventListener('click', function () {
                            background.classList.add('hidden');
                            popupContainer.classList.add('hidden');
                        })
                        attachEditFormSubmit(sectionId);
                    }
                });

        });
    });
    background.classList.add('hidden');
    popupContainer.classList.add('hidden');
}


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
                    closeAllPopups();
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

// Supprimer une section

function deleteSection() {
    const modal = document.querySelector('.popup-delete-section');
    const backdrop = document.querySelector('.modal-backdrop');
    const cancelBtn = document.querySelector('.cancel-btn-section');
    const confirmBtn = document.querySelector('.confirm-btn-section');

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
            .then(res => {
                if (!res.ok) {
                    // Si la réponse n'est pas OK (404, 500 etc)
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.status === 'success' && sectionToDelete) {
                    sectionToDelete.remove();
                    closeAllPopups();
                    console.log("section supprimée avec succès");
                } else {
                    console.error("Erreur côté serveur :", data.message || "Erreur inconnue.");
                }

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


// ajouter une publication

function ajouterPublication() {
    const boutonsPublications = document.querySelectorAll("button.add_post");
    const popupPublication = document.querySelector("div.popupPublication");



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
    document.querySelector('div.popupPublication').classList.add('hidden');
}


function afficherFormulaire(type) {

    const popupPublication = document.querySelector("div.popupPublication");


    const sectionId = popupPublication.dataset.sectionId;
    console.log(sectionId);
    const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
    console.log(codeUe);
    const url = `/professeur/contenu_ue-${codeUe}/section/${sectionId}/publication/create?type=${type}`;
    console.log(url);

    const formulaireContainer = document.querySelector(".formulaireContainer");


    fetch(`/professeur/contenu_ue-${codeUe}/section/${sectionId}/publication/create?type=${type}`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'form') {
                formulaireContainer.innerHTML = data.html;
                bindUploadValidation();
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
        console.log(document.getElementById('admin-status').value)

        const formData = new FormData(form);

        formData.append('admin',document.getElementById('admin-status').value )

        for (let [key, value] of formData.entries()) {
            console.log( "formdata : " + key + ': ' + value);
        }
        console.log(form.action);

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
                    const section = document.querySelector(`.section[data-section-id="${formData.get('publication[section_id]')}"]`);
                    console.log("section = " + section);

                    if (!section) return;

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

                    const newPost = document.createElement("div");
                    newPost.innerHTML = data.html;

                    // On ajoute la nouvelle publication en haut de la liste
                    postsContainer.prepend(newPost.firstElementChild);

                    // Ferme la popup
                    closeAllPopups();
                    console.log("hi");
                    editPublication();
                    supprimerPublication();
                } else if (data.status === "form") {
                    console.log("no valid");
                    formulaireContainer.innerHTML = data.html;
                    attachCreatePublicationListener(); // Rebind
                }
            });
    });
}

function bindUploadValidation() {
    const fileInput = document.querySelector('input[type="file"][name$="[contenuFichier]"]');

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const extension = file.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['pdf', 'zip'];

                if (!allowedExtensions.includes(extension)) {
                    alert('Seuls les fichiers ZIP ou PDF sont acceptés.');
                    e.target.value = ''; // Vide l'input
                }
            }
        });
    }
}

// editer une publication

function editPublication() {
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
                        document.querySelector('.modal-backdrop').classList.remove('hidden');
                        document.querySelector('.modal-backdrop').addEventListener('click', function() {
                            this.classList.add('hidden');
                            document.getElementById('editPublicationModal').style.display = 'none';
                        })
                        inputToggleEditPost();
                        attachEditPublicationFormListener(publicationId); // on passe bien l'id ici
                    }
                })
                .catch(error => {
                    console.error('Erreur AJAX :', error);
                });
        });
    });

// Fermer la modal
// document.querySelector('.close-btn').addEventListener('click', function () {
//     document.getElementById('editPublicationModal').style.display = 'none';
// });
    document.querySelector('.modal-backdrop').classList.add('hidden');
    document.getElementById('editPublicationModal').style.display = 'none';
}

function inputToggleEditPost() {
    console.log("heyyyyyyyy");

    const selectType = document.querySelector('#publication_type_publication_id.editHelp');
    const contenuTexteRow = document.getElementById('contenuTexteRow');
    const contenuFichierRow = document.getElementById('contenuFichierRow');

    console.log("résultat = " + selectType.value);

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

// supprimer une publication

function supprimerPublication() {

    const modal_post = document.querySelector('.popup-delete-publication');
    const backdrop_post = document.querySelector('.modal-backdrop');
    const cancelBtn_post = document.querySelector('.cancel-btn-post');
    const confirmBtn_post = document.querySelector('.confirm-btn-post');

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
}

function epinglement() {



    document.querySelectorAll('.epingle_post').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const codeUe = document.querySelector('span.code').innerHTML;// Stocke le codeUe dans un attribut quelque part
            console.log(codeUe);

            const publicationId = this.dataset.publicationId;

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

                        const post = button.closest('.post');
                        const post_copy = post.cloneNode(true);
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
                            editButton.remove();
                            deleteButton.remove();
                            epingleButtonOriginal.remove();
                        }
                    } else {
                        alert('Erreur lors de l\'épinglage.');
                    }
                })

        });
        if (!window.desepingleListenerAdded) {
            document.addEventListener('click', function(e) {
                if (e.target.closest('.desepingle_post')) {
                    e.preventDefault();
                    const codeUe = document.querySelector('span.code').innerHTML;
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
                                alert('Publication désépinglée !');

                                const desepingleButton = e.target.closest('.desepingle_post');
                                const epinglePost = desepingleButton.closest('.post');
                                const publicationId = epinglePost.getAttribute('data-id');

                                if (epinglePost) {
                                    // 1. Retrouver l'élément original dans la section
                                    const originalPost = document.querySelector('.sections-wrapper .post[data-id="' + publicationId + '"]');

                                    if (originalPost) {
                                        // 2. Trouver l'interactions_post de ce post
                                        const interactions = originalPost.querySelector('.interactions_post');

                                        if (interactions) {
                                            // 3. Vérifier si le bouton epingle existe déjà (éviter les doublons)
                                            let existingEpingleButton = interactions.querySelector('.epingle_post');
                                            if (!existingEpingleButton) {
                                                // 4. Recréer le bouton epingle
                                                const newEpingleButton = document.createElement('button');
                                                newEpingleButton.classList.add('epingle_post');
                                                newEpingleButton.setAttribute('data-publication-id', publicationId);
                                                newEpingleButton.innerHTML = '<i class="fa-solid fa-thumbtack"></i>';

                                                interactions.appendChild(newEpingleButton);

                                                // 5. (Important) Re-binder l'event listener sur ce nouveau bouton
                                                rebindAllEpinglePostButtons();
                                                originalPost.querySelector(".epingle_post").style.display = 'inline';
                                            }
                                        }
                                    }

                                    // 6. Supprimer l'élément de la liste des épinglés
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
