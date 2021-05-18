const vLock = {
    addeventBtnLock() {
        $('.btnLock').click(function () {
            console.log("sdfsdf");
            vLock.unLockScreen();
        });
    },
    unLockScreen() {
        let password = $("input[name=password]").val(); 
        LoaderShow();
        $.post('/Auth/unLockScreen', { password: password }, function (dataResult) {
            LoaderHide();
            if (dataResult.isSuccess) {
                window.location = dataResult.redirect;  

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