document.addEventListener("DOMContentLoaded", function () {
    const darkBackground = document.querySelector("div.darkBackground");
    const popupPublication = document.querySelector("div.popupPublication");
    const popupListeUsers = document.querySelector("div.popUpListe");
    const allPopups = document.querySelectorAll(".popup");

    const boutonPublication = document.querySelector("button.add_post");
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

    // ----- POPUP CREATION PUBLICATION -----

    boutonPublication.addEventListener("click", function (e) {
        e.stopPropagation();
        openPopup(popupPublication);
    });

    function afficherFormulaire(type) {
        if (type === "texte") {
            formulaireContainer.innerHTML = `
                <h3>Formulaire Texte</h3>
                <form>
                    <input type="text" placeholder="Titre" required><br>
                    <textarea placeholder="Contenu..." rows="4" required></textarea><br>
                    <button type="submit">Envoyer</button>
                </form>`;
        } else {
            formulaireContainer.innerHTML = `
                <h3>Formulaire Fichier</h3>
                <form>
                    <input type="text" placeholder="Nom du fichier" required><br>
                    <input type="file" required><br>
                    <button type="submit">Uploader</button>
                </form>`;
        }
    }

    boutonText.addEventListener("click", () => {
        switchBg.style.left = "0%";
        afficherFormulaire("texte");
    });

    boutonFile.addEventListener("click", () => {
        switchBg.style.left = "50%";
        afficherFormulaire("fichier");
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
