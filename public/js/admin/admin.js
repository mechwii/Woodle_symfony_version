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
    popupManager.openAddPopupUser()
    console.log('User')

}

function ajouterUE(){
    console.log('UE')
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
            window.popupManager.openModifyUserPopup(id, user.nom, user.prenom, user.email, user.image ,user.telephone, user.roles, user.ue);

        })
        .catch(error =>{
            console.log('Erreur delete user : ' + error)
            alert("Impossible de récuper les informations de l'utilisateur")
        })


}

