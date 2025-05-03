/**
 * Fonction qui permet d'éditer les profils de chaque utilisateur
 * @param id
 */
function editProfil(id){
    // On récupère tous les champs au départ
    const nom = document.getElementById('user_profile_nom').value;
    const prenom= document.getElementById('user_profile_prenom').value;
    const password= document.getElementById('user_profile_password').value;

    // On forme notre tableau de données qui va être envoyé
    const userData = {
        id : id,
        nom: nom,
        prenom: prenom,
        password: password,
    };

    // On vérifie que tous les champs sont remplis
    if(nom !== "" && prenom !=="" && password !== ""){
        // On fait la requête fetch pour mettre à jour
        fetch("/edit-profil/" + id , {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(userData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Si la requete s'execute correctemnt on affiche un succès sinon une erreur
                    alerte.showSuccess("Profil modifié avec succès !");
                } else {
                    alerte.showError(data.error || "Erreur lors de la modification du profil");
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alerte.showError("Erreur lors de la modification du profil");
            });

    } else {
        alerte.showError("Veuillez remplir tous les champs");
    }
}