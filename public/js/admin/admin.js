// En soit j'ai besoin d'un seul bouton pour ajouter une UE ou un User mais la popup est différent, j'utilise donc cette variable pour appeler des fonctions différentes
let variable_pour_boutton_ajout=1 // 1 pour Users, 2 pour UEs

/**
 * Bascule l'affichage vers la vue des UE
 */
function SelectUE() {
    resetFilter();

    // On met à jour la variable après un léger délai pour être sûr que le filtre soit bien reset
    setTimeout(()=>{
        // Comme ça on est sur que on reset bien le filter car on utilise la variable, qu'elle ne change pas avant
        variable_pour_boutton_ajout=2
    })

    // Animation du sélecteur visuel
    const categorie = document.getElementById('categorie-selected');
    categorie.style.transform = 'translateX(100%)';

    // Changement des couleurs des onglets après un petit délai
    setTimeout(() => {
        document.getElementById('dashboard-selects').children.item(1).style.color = 'white';
        document.getElementById('dashboard-selects').children.item(0).style.color = 'black';
    }, 100);

    // Affichage du contenu UE et masquage du contenu User
    document.getElementById("user-content").style.display = "none";
    document.getElementById("ue-content").style.display = "block";

}

/**
 * Bascule l'affichage vers la vue des Utilisateurs
 */
function SelectUser() {
    resetFilter();

    // Même logique de délai que pour la fonction précédente
    setTimeout(()=>{
        variable_pour_boutton_ajout=1
    })


    // Animation inverse
    document.getElementById('categorie-selected').style.transform = 'translateX(0)';

    // Changement des couleurs
    setTimeout(() => {
        document.getElementById('dashboard-selects').children.item(0).style.color = 'white';
        document.getElementById('dashboard-selects').children.item(1).style.color = 'black';
    }, 100);

    // Affichage du contenu User et masquage du contenu UE
    document.getElementById("ue-content").style.display = "none";
    document.getElementById("user-content").style.display = "block";
}

/**
 * Gère l'action du bouton Ajouter en fonction de la vue active
 */
function handleAjout(){
    // En fonction de l'ajout on appelle la bonne fonction
    variable_pour_boutton_ajout === 1 ? ajouterUser() : ajouterUE();
}

/**
 * Ouvre la popup d'ajout d'utilisateur
 */
function ajouterUser(){
    // popupManager popCatégorie nous permet de savoir la catégorie soit 'User' soit 'UE'
    popupManager.popupCat = 1;

    // Et ensuite on ouvre la popup d'ajout
    popupManager.openAddPopupUser();
}

/**
 * Ouvre la popup d'ajout d'UE
 */
function ajouterUE(){
    popupManager.popupCat = 2;

    // On ouvre la popup d'ajout d'UE
    popupManager.openAddPopupUE();
}

/**
 * Prépare la suppression d'un utilisateur en récupérant d'abord ses infos
 * @param {number} id - L'ID de l'utilisateur à supprimer
 */
function supprimerUtilisateur(id){
   // On sait jamais si quelqu'un a modifié, donc je récupère les infos depuis la BDD pour l'afficher correctemnt
    fetch(`/admin/get-user/${id}`)
        .then(response => {
            if(!response.ok){
                throw new Error('Erreur lors de la récupération des données');
            }
            return response.json();
        })
        .then(user =>{
            if(user.error){
                throw new Error(user.error);
            }
            console.log("ok : " + user.toString()) ;
            // J'ouvre la popup de delete USER
            window.popupManager.openDeleteUserPopup(id, user.nom, user.prenom, user.image);
        })
        .catch(error =>{
            console.log('Erreur delete user : ' + error)
            alerte.showError("Impossible de récuper les informations de l'utilisateur")
        })
}

/**
 * Prépare la suppression d'une UE en récupérant d'abord ses infos, puis en ouvrant la popup
 * @param {string} code - Le code de l'UE à supprimer
 */
function supprimerUE(code){
    // Pareil pour les UE, avant d'ouvrir la popup on récupère les infos depuis la BDD
    fetch(`/admin/get-one-ue/${code}`)
        .then(response => {
            if(!response.ok){
                throw new Error('Erreur lors de la récupération des UE')
            }
            return response.json();
        })
        .then(ue =>{
            if(ue.error){
                throw new Error(ue.error)
            }
            // J'ouvre la popup delete UE avec les informations de l'UE
            window.popupManager.openDeleteUEPopup(ue.ue.code, ue.ue.nom, ue.ue.image)

        }).catch(error => {
            console.error('Erreur delete ue : ' + error);

            // Si ça marche pas j'envoie une alerte avec une erreur
            alerte.showError("Impossible de récupere les informations de l'UE")
    })

}

/**
 * Ouvre la popup de modification d'une UE
 * @param {string} id - Le code de l'UE à modifier
 */
function modifierUtilisateur(id){
    // Toujours même processus on récupère pour que ce soit réactif
    fetch(`/admin/get-user/${id}`)
        .then(response => {
            if(!response.ok){
                throw new Error('Erreur lors de la récupération des données');
            }
            return response.json();
        })
        .then(user =>{
            if(user.error){
                throw new Error(user.error);
            }

            // Popup catégorié 1 -> USER
            window.popupManager.popupCat = 1;

            // Ensuite on ouvre la popup d'édition avec tous les paramètre pour préremplir
            window.popupManager.openModifyUserPopup(id, user.nom, user.prenom, user.email, user.image, user.roles, user.ue, user.password);

        })
        .catch(error =>{
            console.log('Erreur delete user : ' + error)
            alerte.showError("Impossible de récuper les informations de l'utilisateur")
        })


}

/**
 * Ouvre la popup de modification d'une UE
 * @param {string} id - Le code de l'UE à modifier
 */
function modifierUE(id){
    // Même processus que même au dessus
    fetch(`/admin/get-one-ue/${id}`)
        .then(response => {
            if(!response.ok){
                console.log(response)
                throw new Error('Erreur lors de la récupération des données');
            }
            return response.json();
        })
        .then(ue => {
            if(ue.error){
                throw new Error(ue.error);
            }

            const ues = ue.ue;
            popupManager.popupCat = 2;
            popupManager.openEditPopupUE(
                ues.code,
                ues.nom,
                ues.responsable_id,
                ues.responsable_nom,
                ues.image,
                ues.utilisateurs_affectes
            );
        })
        .catch(e => {
            console.log('Erreur open edit ue popup : ' + e);
        });
}

/**
 * Charge les responsables pour les afficher dans la popup user pour ajouter une nouvelle UE
 */
function showAdditionallUE(){
    // On récupère tous les responsables
    fetch('/admin/get-responsables')
        .then(res => res.json())
        .then(data => {
            // On ouvre dans la popup utilisateur la partie UE pour en ajouter une nouvelle
            popupManager.displayAdditionnalPartOfPopup(data);
        })
        .catch(error => {
            console.error("Erreur lors du chargement des utilisateurs", error);
        });}


/**
 * Réinitialise le filtre de recherche par texte en fonction d'UE Ou USER
 */
function resetFilter(){
    // on réinitialise le champs input
    document.getElementById('text-filter').value = '';
    // puis en fonction de la catégorie on re affiche toutes les ue ou utilisateurs
    if(variable_pour_boutton_ajout === 1){
        const users = document.querySelectorAll('#user-content .card-box')
        users.forEach(user => {
            user.style.display = 'flex';
        })
    } else{
        const ues = document.querySelectorAll('#ue-content .card-box');
        ues.forEach(ue => {
            ue.style.display = 'flex';
        })
    }
}

// Initialisation du filtre de recherche quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('text-filter');

    // On rajoute un écouteur sur notre input, pour filrer
    filterInput.addEventListener('input', function () {
        const filterText = this.value.toLowerCase();

        if (variable_pour_boutton_ajout === 1) {
            // Initialisation du filtre de recherche quand le DOM est chargé
            const users = document.querySelectorAll('#user-content .card-box');
            users.forEach(user => {
                const name = user.querySelector('#name-firstname-section').textContent.toLowerCase();
                user.style.display = (name.includes(filterText)) ? 'flex' : 'none';
            });
        } else {
            // Filtrage des UEs
            const ues = document.querySelectorAll('#ue-content .card-box');
            ues.forEach(ue => {
                const ueName = ue.querySelector('.card-content h4').textContent.toLowerCase();
                ue.style.display = ueName.includes(filterText) ? 'flex' : 'none';
            });
        }
    });
});


