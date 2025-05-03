/**
 * Fonction qui permet d'afficher le mini menu pour passer de prof <-> admin quand c'est possible
 */
function displaySelectMenu() {
    // dans ce cas on ouvre juste le menu
    const valSelect = document.getElementById('additional-roles');
    valSelect.style.display = valSelect.style.display === 'block' ? 'none' : 'block';
}

/**
 * Ouvre le menu qui nous permet d'accèder au profil et d enous déconnecter
 */
function toggleProfileMenu() {
    // On ouvre le menu
    const profileMenu = document.getElementById('profile-menu');
    profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
}

// Pour cancel le menu si il n'est pas cliqué, et donc si il est cliqué en dehors
document.addEventListener('click', function (event) {
    const profileMenu = document.getElementById('profile-menu');
    const profilePicture = document.getElementById('admin-picture');

    const valSelect = document.getElementById('additional-roles');
    const roles = document.getElementById('roles-changes');

    if (event.target !== profilePicture && !profilePicture.contains(event.target)) {
        profileMenu.style.display = 'none';
    }

});
