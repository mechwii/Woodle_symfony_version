function editProfil(id){
    const nom = document.getElementById('user_profile_nom').value;
    const prenom= document.getElementById('user_profile_prenom').value;
    const password= document.getElementById('user_profile_password').value;

    const userData = {
        id : id,
        nom: nom,
        prenom: prenom,
        password: password,
    };

    if(nom !== "" && prenom !=="" && password !== ""){
        console.log(id)

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
                    console.log("reussi " + data.message)
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