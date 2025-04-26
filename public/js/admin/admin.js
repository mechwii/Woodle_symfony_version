// En soit j'ai besoin d'un seul bouton pour ajouter une UE ou un User mais la popup est différent, j'utilise donc cette variable pour appeler des fonctions différentes
let variable_pour_boutton_ajout=1

function SelectUE() {
    resetFilter();

    setTimeout(()=>{
        // Comme ça on est sur que on reset bien le filter car on utilise la variable, qu'elle ne change pas avant
        variable_pour_boutton_ajout=2
    })

    const categorie = document.getElementById('categorie-selected');
    categorie.style.transform = 'translateX(100%)';
    setTimeout(() => {
        document.getElementById('dashboard-selects').children.item(1).style.color = 'white';
        document.getElementById('dashboard-selects').children.item(0).style.color = 'black';
    }, 100);
    document.getElementById("user-content").style.display = "none";
    document.getElementById("ue-content").style.display = "block";

}

function SelectUser() {
    resetFilter();
    setTimeout(()=>{
        variable_pour_boutton_ajout=1
    })


    document.getElementById('categorie-selected').style.transform = 'translateX(0)';
    setTimeout(() => {
        document.getElementById('dashboard-selects').children.item(0).style.color = 'white';
        document.getElementById('dashboard-selects').children.item(1).style.color = 'black';
    }, 100);
    document.getElementById("ue-content").style.display = "none";
    document.getElementById("user-content").style.display = "block";
}

function handleAjout(){
    variable_pour_boutton_ajout === 1 ? ajouterUser() : ajouterUE();
}
function ajouterUser(){
    popupManager.popupCat = 1;
    popupManager.openAddPopupUser();
    console.log('User')

}

function ajouterUE(){
    console.log('UE')
    console.log('UEs')
    popupManager.popupCat = 2;

    popupManager.openAddPopupUE();
}

function supprimerUtilisateur(id){
   // On sait jamais si quelqu'un a modifié, donc je récupère les infos depuis la BDD
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
            window.popupManager.openDeleteUserPopup(id, user.nom, user.prenom, user.image);
        })
        .catch(error =>{
            console.log('Erreur delete user : ' + error)
            alerte.showError("Impossible de récuper les informations de l'utilisateur")
        })
}

function supprimerUE(code){
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
            window.popupManager.openDeleteUEPopup(ue.ue.code, ue.ue.nom, ue.ue.image)

        }).catch(error => {
            console.error('Erreur delete ue : ' + error);
        alerte.showError("Impossible de récupere les informations de l'UE")
    })

}

function modifierUtilisateur(id){

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
            window.popupManager.popupCat = 1;
            window.popupManager.openModifyUserPopup(id, user.nom, user.prenom, user.email, user.image, user.roles, user.ue, user.password);

        })
        .catch(error =>{
            console.log('Erreur delete user : ' + error)
            alerte.showError("Impossible de récuper les informations de l'utilisateur")
        })


}

function modifierUE(id){
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

function showAdditionallUE(){
    fetch('/admin/get-responsables')
        .then(res => res.json())
        .then(data => {
            popupManager.displayAdditionnalPartOfPopup(data);
        })
        .catch(error => {
            console.error("Erreur lors du chargement des utilisateurs", error);
        });}

function resetFilter(){
    document.getElementById('text-filter').value = '';
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

document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('text-filter');

    filterInput.addEventListener('input', function () {
        const filterText = this.value.toLowerCase();

        if (variable_pour_boutton_ajout === 1) {
            const users = document.querySelectorAll('#user-content .card-box');
            users.forEach(user => {
                const name = user.querySelector('#name-firstname-section').textContent.toLowerCase();
                user.style.display = (name.includes(filterText)) ? 'flex' : 'none';
            });
        } else {
            // Mode UE
            const ues = document.querySelectorAll('#ue-content .card-box');
            ues.forEach(ue => {
                const ueName = ue.querySelector('.card-content h4').textContent.toLowerCase();
                ue.style.display = ueName.includes(filterText) ? 'flex' : 'none';
            });
        }
    });
});


