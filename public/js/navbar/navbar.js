function displaySelectMenu() {
    const valSelect = document.getElementById('additional-roles');
    valSelect.style.display = valSelect.style.display === 'block' ? 'none' : 'block';
}

function toggleProfileMenu() {
    const profileMenu = document.getElementById('profile-menu');
    profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
}

// Pour cancel le menu si il n'est pas cliqué
document.addEventListener('click', function (event) {
    const profileMenu = document.getElementById('profile-menu');
    const profilePicture = document.getElementById('admin-picture');

    const valSelect = document.getElementById('additional-roles');
    const roles = document.getElementById('roles-changes');

    if (event.target !== profilePicture && !profilePicture.contains(event.target)) {
        profileMenu.style.display = 'none';
    }

});
