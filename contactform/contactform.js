jQuery(document).ready(function($) {
  "use strict";

  //Contact
  $('form.contactForm').submit(function() {
    var f = $(this).find('.form-group'),
      ferror = false,
      emailExp = /^[^\s()<>@,;:\/]+@\w[\w\.-]+\.[a-z]{2,}$/i;

    f.children('input').each(function() { // run all inputs

      var i = $(this); // current input
      var rule = i.attr('data-rule');

      if (rule !== undefined) {
        var ierror = false; // error flag for current input
        var pos = rule.indexOf(':', 0);
        if (pos >= 0) {
          var exp = rule.substr(pos + 1, rule.length);
          rule = rule.substr(0, pos);
        } else {
          rule = rule.substr(pos + 1, rule.length);
        }

        switch (rule) {
          case 'required':
            if (i.val() === '') {
              ferror = ierror = true;
            }
            break;

          case 'minlen':
            if (i.val().length < parseInt(exp)) {
              ferror = ierror = true;
            }
            break;

          case 'email':
            if (!emailExp.test(i.val())) {
              ferror = ierror = true;
            }
            break;

          case 'checked':
            if (! i.is(':checked')) {
              ferror = ierror = true;
            }
            break;

          case 'regexp':
            exp = new RegExp(exp);
            if (!exp.test(i.val())) {
              ferror = ierror = true;
            }
            break;
        }
        i.next('.validation').html((ierror ? (i.attr('data-msg') !== undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
      }
    });
    f.children('textarea').each(function() { // run all inputs

      var i = $(this); // current input
      var rule = i.attr('data-rule');

      if (rule !== undefined) {
        var ierror = false; // error flag for current input
        var pos = rule.indexOf(':', 0);
        if (pos >= 0) {
          var exp = rule.substr(pos + 1, rule.length);
          rule = rule.substr(0, pos);
        } else {
          rule = rule.substr(pos + 1, rule.length);
        }

        switch (rule) {
          case 'required':
            if (i.val() === '') {
              ferror = ierror = true;
            }
            break;

          case 'minlen':
            if (i.val().length < parseInt(exp)) {
              ferror = ierror = true;
            }
            break;
        }
        i.next('.validation').html((ierror ? (i.attr('data-msg') != undefined ? i.attr('data-msg') : 'wrong Input') : '')).show('blind');
      }
    });
    if (ferror) return false;

    var form = $(this);
    var action = form.attr('action') || '/api/contact';
    var button = form.find('button[type="submit"]');
    var payload = {
      name: form.find('input[name="name"]').val(),
      email: form.find('input[name="email"]').val(),
      subject: form.find('input[name="subject"]').val(),
      message: form.find('textarea[name="message"]').val(),
      company: form.find('input[name="company"]').val()
    };

    $("#sendmessage").removeClass("show");
    $("#errormessage").removeClass("show").html('');
    button.prop('disabled', true).text('Sending...');

    $.ajax({
      type: "POST",
      url: action,
      data: JSON.stringify(payload),
      contentType: 'application/json; charset=UTF-8',
      dataType: 'json'
    }).done(function(response) {
      if (response && response.ok) {
        $("#sendmessage").addClass("show");
        $('.contactForm').find("input[type!=hidden], textarea").val("");
      } else {
        $("#errormessage").addClass("show");
        $('#errormessage').html(response && response.message ? response.message : 'We could not send your message. Please try again.');
      }
    }).fail(function(xhr) {
      var message = 'We could not send your message. Please try again.';

      if (xhr.responseJSON && xhr.responseJSON.message) {
        message = xhr.responseJSON.message;
      }

      $("#errormessage").addClass("show");
      $('#errormessage').html(message);
    }).always(function() {
      button.prop('disabled', false).text('Send Request');
    });

    return false;
  });

});
