$(document).ready(function () {

    setFormValidation('#frmMain');

    $('.textarea-editor').summernote({
        height: 300,                // set editor height
        minHeight: null,            // set minimum height of editor
        maxHeight: null,            // set maximum height of editor
        lang: 'es-ES',              // default: 'en-US'
        dialogsInBody: true,
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['table', ['table']],
            ['insert', ['link', 'picture', 'hr', 'video']],
            ['view', ['fullscreen', 'codeview']],
            ['help', ['help']]
        ],
        fontSizes: ['8', '9', '10', '11', '12', '14', '18', '24', '36', '48', '64', '82', '150']
    });

    $("#Code").focusout(function () {
        var oldCode = $("#OldCode").val();
        var newCode = $(this).val();

        if ((oldCode != newCode)) {
            codeExist(newCode);
        }
        return false;
    });

});

function createRecord(controller) {
    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    deactivateCodeview();

    if ($('#Header').summernote('isEmpty') ||
        $('#Template').summernote('isEmpty') ||
        $('#Footer').summernote('isEmpty')) {
        Swal.fire({
            type: 'error',
            title: '',
            text: validateSummernote(),
            footer: ''
        });
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/' + controller + '/create',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => cancel()
                });
            } else {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}

function updateRecord(controller) {

    var form = $("#frmMain");
    form.validate();

    if (!form.valid())
        return;

    deactivateCodeview();

    if ($('#Header').summernote('isEmpty') ||
        $('#Template').summernote('isEmpty') ||
        $('#Footer').summernote('isEmpty')) {

        Swal.fire({
            type: 'error',
            title: '',
            text: validateSummernote(),
            footer: ''
        });
        return;
    }

    $.ajax({
        type: 'PUT',
        url: '/' + controller + '/update',
        dataType: 'json',
        data: $("form").serialize(),
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            if (data.isSuccess) {
                Swal.fire({
                    type: 'success',
                    title: '',
                    text: data.successMessage,
                    footer: '',
                    onAfterClose: () => cancel()
                });
            } else {
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: ''
                });
            }
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            LoaderHide();
            Swal.fire({
                type: 'error',
                title: '',
                text: error,
                footer: ''
            });
        }
    });
}

function codeExist(code) {

    $.ajax({
        type: 'GET',
        url: '/MeetingNoteTemplates/GetByCode',
        dataType: 'json',
        data: { code: code },
        beforeSend: function () {
        },
        success: function (data) {
            if (data.valueBoolean) {
                $("#Code").val($("#OldCode").val());
                Swal.fire({
                    type: 'error',
                    title: '',
                    text: data.errorMessage,
                    footer: '',
                    onAfterClose: () => $("#Code").focus()
                });
            }
        },
        complete: function () {
        },
        error: function (xhr, status, error) {
        }
    })
}

function cancel() {
    LoaderShow();
    location.href = '/MeetingNoteTemplates';
}

function validateSummernote() {
    var isEmpty = "";
    var errorMsg = $('#RequiredField').val();

    if ($('#Header').summernote('isEmpty') ) {
        isEmpty = errorMsg.replace('{0}', $('#HeaderTag').val().toLowerCase());
        return isEmpty;
    }

    if ($('#Template').summernote('isEmpty')) {
        isEmpty = errorMsg.replace('{0}', $('#TemplateTag').val().toLowerCase());
        return isEmpty;
    }

    if ($('#Footer').summernote('isEmpty')) {
        isEmpty = errorMsg.replace('{0}', $('#FooterTag').val().toLowerCase());
        return isEmpty;
    }

    return isEmpty;
}

function deactivateCodeview() {

    if ($('#Header').summernote('codeview.isActivated')) {
        $('#Header').val($('#Header').summernote('code'));
        $('#Header').summernote('codeview.deactivate');
    }

    if ($('#Template').summernote('codeview.isActivated')) {
        $('#Template').val($('#Template').summernote('code'));
        $('#Template').summernote('codeview.deactivate');
    }

    if ($('#Footer').summernote('codeview.isActivated')) {
        $('#Footer').val($('#Footer').summernote('code'));
        $('#Footer').summernote('codeview.deactivate');
    }

}