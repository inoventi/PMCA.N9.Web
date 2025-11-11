const vLock = {
    addeventBtnLock() {
        $('.btnLock').click(function () {
            console.log("sdfsdf");
            vLock.unLockScreen();
        });
    },
    unLockScreen() {
        let password = $("input[name=password]").val(); 
        let login = $("input[name=login]").val(); 
        let env = $("input[name=env]").val(); 
        LoaderShow();
        $.post('/Auth/unLockScreen', { password: password, login: login, env: env}, function (dataResult) {
            LoaderHide();
            if (dataResult.isSuccess) {
                //window.location = dataResult.redirect;  
                window.history.back();

            } else {
                Swal.fire({
                        type: 'error',
                        title: '',
                    text: dataResult.errorMessage,
                        footer: ''
                    });
            }
            

        }); 
    }
}


$(function () {
    vLock.addeventBtnLock();
})