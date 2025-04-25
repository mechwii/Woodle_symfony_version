// En soit j'ai besoin d'un seul bouton pour ajouter une UE ou un User mais la popup est différent, j'utilise donc cette variable pour appeler des fonctions différentes
let variable_pour_boutton_ajout=1

function SelectUE() {
    variable_pour_boutton_ajout=2

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
    variable_pour_boutton_ajout=1

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
            alert("Impossible de récuper les informations de l'utilisateur")
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
            alert("Impossible de récupere les informations de l'UE")
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
            window.popupManager.openModifyUserPopup(id, user.nom, user.prenom, user.email, user.image, user.roles, user.ue);

        })
        .catch(error =>{
            console.log('Erreur delete user : ' + error)
            alert("Impossible de récuper les informations de l'utilisateur")
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



