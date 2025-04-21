document.addEventListener("DOMContentLoaded", function () {
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
