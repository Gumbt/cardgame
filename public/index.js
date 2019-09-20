var username = localStorage['user'];
if (username != '' || username != null) {
    window.location = '/jogar.html';
}
$("#loginForm").submit(function (e) {
    e.preventDefault();
    localStorage['user'] = $('#user').val();
    window.location = '/jogar.html';
});