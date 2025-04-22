
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
            });
        });

        function afficherFormulaire(type) {
            const sectionId = popupPublication.dataset.sectionId;

            if (type === "texte") {
                formulaireContainer.innerHTML = `
<!--            <form id="form-publication" action="{{ path('ajouter_publication') }}" method="post">-->
            <form id="form-publication" action="" method="post">
                <input type="hidden" name="section_id" value="${sectionId}">
                <input type="text" name="titre" placeholder="Titre" required>
                <select name="type_publication">
                    <option value="">--Type de publication--</option>
                    <option value="calendar">Evenement</option>
                    <option value="warning">Important</option>
                    <option value="info">Information</option>
                </select>
                <textarea name="contenu" placeholder="Contenu..." rows="4" required></textarea>
                <button type="submit">Envoyer</button>
            </form>`;
            } else {
                formulaireContainer.innerHTML = `
                <form>
                    <input type="text" placeholder="Nom du fichier" required><br>
                    <div class="drop-zone">
                        <span class="drop-zone__prompt">Déposer le fichier</span>
                            <div class="separator">
                            <hr>
                            <span class="ou">OU</span>
                            </div>
                        <div class="fake-button">
                            Parcourir les fichiers
                        </div>
                        <input type="file" name="myFile" class="drop-zone__input">
                    </div>
                    <button type="submit">Uploader</button>
                </form>`;
            }
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

    // Ouvrir la popup de modification
    document.querySelectorAll('.edit_section').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionDiv = btn.closest('.section');
            const sectionId = sectionDiv.classList[1].split('-')[1];

            fetch(`/professeur/contenu_ue-IA41/section/${sectionId}/edit`)
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
        const form = document.querySelector('.edit-section-form');
        form.addEventListener('submit', e => {
            e.preventDefault();

            const formData = new FormData(form);

            fetch(`/professeur/contenu_ue-IA41/section/${sectionId}/edit`, {
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

        fetch(`/professeur/contenu_ue-IA41/section/${sectionIdToDelete}/delete`, {
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

}




document.addEventListener("DOMContentLoaded", function () {
    reloadAll();
})

// Ajotuer le create dans la bonne popup


document.addEventListener('DOMContentLoaded', () => {
    const popupContainer = document.querySelector('.popupAddSection');
    const background = document.querySelector('.darkBackground');

    // Ouvrir la popup de modification
    document.querySelector('.add_section').addEventListener('click', () => {
    console.log(document.querySelector('.add_section'));
            fetch(`/professeur/contenu_ue-IA41/section/create`)
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

        fetch(`/professeur/contenu_ue-IA41/section/create`, {
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

                    // Ajouter à la page
                    sectionContainer.appendChild(newSection);

                    // Rebind des évents JS (pour le bouton "éditer" de cette nouvelle section)
                    // bindAddPostButtons(); // ← à créer si besoin
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