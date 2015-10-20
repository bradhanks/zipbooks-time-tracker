$(document).ready(function(){

    var userEditedInvoiceNumber;
    if ($('input[name=number]').val()!=''){
        userEditedInvoiceNumber = true;
    }
    var addedCustomerNames = new Array();
    var unbilledExpensesOnly;

    displayAddressAndUnbilled();

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Display customer address, suggested invoice number, and unbilled items on EXISTING customer select
    $('select[name=customer]').change(function(){

        displayAddressAndUnbilled();

    });

    $('body').on('click', '#addUnbilledModalOpener', function() {

        if (unbilledExpensesOnly==true){
            // simulate add now click
            $('#addLineItems').trigger('click');
        } else {
            $('#addUnbilledModal').modal('show');
        }
    });

    $('#selectTimeEntryDateRange').click(function(){
        $(this).hide();
        $('#timeEntryDateRangeSelector').show();
    });

    $('#selectProjects').click(function(){
        $(this).hide();
        $('#projectsSelector').show();
    });

    $('#addLineItems').click(function(){

        var view = $('#addUnbilledModal .tab-pane.active').attr('id');
        var show = $("#" + view + " .show-options input:checkbox:checked").map(function(){
            return $(this).val();
        }).get();


        var fromDate = $('#fromDate').val();
        var toDate = $('#toDate').val();
        var expenses = ($('#expenses').is(':checked')==true) ? 1 : 0;
        var customerId = $('#customerId').val();

        var projects = $("#projectsList input:checkbox:checked").map(function(){
            return $(this).val();
        }).get();

        $.get('/api/v1/invoices/line_items',
            {
                view: view,
                show: show,
                from_date: fromDate,
                to_date: toDate,
                expenses: expenses,
                customer_id: customerId,
                projects: projects

            }, function(response){

            if (response.success==true){

                placeTimeEntryLineItems(response.unbilled_time_entry_line_items);
                placeItemLineItems(response.unbilled_item_line_items);

                $('#unbilledNotice').slideUp().html();
                clearEmptyLineItems();
                updateTotal();

            } else {

            }

        }).error(function(){


        });

    });


    $('select[name=customer]').selectize({
        create: true,
        sortField: {
            field: 'text',
            direction: 'asc'
        },
        openOnFocus: true,
        selectOnTab: true,
        dropdownParent: null,
        onOptionAdd: function(option){

            addedCustomerNames.push(option);
            $('.new-customer-data').slideDown('fast');
            $('#unbilledNotice').html('');
            $('input[name=new_customer]').val('1');

            var suggestedInvoiceNumber = option.replace(/\W/g, '').toUpperCase().substring(0,5) + '-0001';
            $('input[name=number]').val(suggestedInvoiceNumber);

        },
        onItemAdd: function(item){

            if(addedCustomerNames.indexOf(item) > -1){
                $('.new-customer-data').slideDown('fast');
                $('#unbilledNotice').html('');
                $('input[name=new_customer]').val('1');
            }

        }
    });

    $('select[name=new_customer_country]').selectize({
        openOnFocus: false,
        selectOnTab: true
    });
	
    $('select[name=new_user_country]').selectize({
        openOnFocus: false,
        selectOnTab: true
    });

    function displayAddressAndUnbilled(){

        var customerId = $('select[name=customer]').val();

        if (customerId){

            $.get('/api/v1/customer', {id: customerId }, function(response){

                if (response.success==true){

                    // Get rid of new customer stuff
                    $('.new-customer-data').slideUp('fast');
                    $('input[name=new_customer]').val('');

                    // Display Address
                    var addressHtml = (response.customer.address_2) ? response.customer.address_1 + '<br />' + response.customer.address_2 : response.customer.address_1;
                    $('#customerAddress').html(addressHtml);
                    $('#customerAddress').html(addressHtml);
                    $('#customerCity').html(response.customer.city);
                    if (response.customer.city!='' && response.customer.state!='') {
                        $('#customerCity').html(response.customer.city + '.');
                    } else {
                        $('#customerCity').html(response.customer.city);
                    }
                    $('#customerState').html(response.customer.state);
                    $('#customerPostalCode').html(response.customer.postal_code);

                    // If invoice number hasn't been filled out, suggest the number
                    if(userEditedInvoiceNumber!=true){
                        $('#number').val(response.suggested_invoice_number);
                    }
                    // If unbilled time entries or expenses, display notice and set vars
                    if (response.unbilled_time_entries || response.unbilled_expenses) {
                        var unbilledNoticeHtml = '<p>' + response.customer.name + ' has unbilled ';
                        unbilledNoticeHtml += (response.unbilled_time_entries) ? 'time' : '';
                        unbilledNoticeHtml += (response.unbilled_time_entries && response.unbilled_expenses) ? ' and ' : '';
                        unbilledNoticeHtml += (response.unbilled_expenses) ? 'expenses' : '';
                        unbilledNoticeHtml += '.<br /><a id="addUnbilledModalOpener">Add to Invoice</a></p>';
                        //unbilledNoticeHtml += '.<br /><a id="addUnbilled">Add to Invoice</a></p>';

                        $('#unbilledNotice').html(unbilledNoticeHtml).hide().slideDown('fast');

                    } else {
                        $('#unbilledNotice').html('');
                    }

                    // if only expenses
                    if (response.unbilled_expenses && !response.unbilled_time_entries) {
                        unbilledExpensesOnly = true;
                    }

                    // Put projects into modal
                    if (response.customer.projects) {
                        listProjects(response.customer.projects);
                    }

                    // Add customer ID to modal
                    $('#customerId').val(response.customer.id);



                } else {
                    $('#customerAddress').html('Whoa!  There was an error loading this customer\'s info.  Please reload the page and start over.');
                    clearAddress();
                }

            }).error(function(){
                $('#customerAddress').html('Whoa!  There was an error loading this customer\'s info.  Please reload the page and start over.');
                clearAddress();
            });

        } else {

            clearAddress();
        }
    }

    function clearAddress(){
        $('#customerAddress').html('');
        $('#customerCity').html('');
        $('#customerState').html('');
        $('#customerPostalCode').html('');
    }

    function listProjects(projects){

        var projectsHtml = '';

        for (var key in projects) {
            projectsHtml += '<div class="col-md-6 no-margin-padding"><input type="checkbox" checked="checked" name="projects[' + projects[key].id + ']" id="project' + projects[key].id + '" value="' + projects[key].id + '" />&nbsp;';
            projectsHtml += '<label for="project' + projects[key].id + '">' + projects[key].name + '</label></div>';
        }

        $('#projectsList').html(projectsHtml);

    }

    function placeTimeEntryLineItems(unbilledTimeEntryLineItems){

        // Add unbilled time entries to invoice
        if (unbilledTimeEntryLineItems){

            for (var key in unbilledTimeEntryLineItems) {
                if (unbilledTimeEntryLineItems.hasOwnProperty(key)) {

                    var newLineItem = addLineItem('time-entry');

                    var lineId = newLineItem.attr('data-line-id');

                    var lineTotal = numberWithCommas((unbilledTimeEntryLineItems[key].rate * unbilledTimeEntryLineItems[key].quantity).toFixed(2));

                    newLineItem.find('[name*="name"]').val(unbilledTimeEntryLineItems[key].name).trigger('autosize.resize');
                    newLineItem.find('[name*="notes"]').val(unbilledTimeEntryLineItems[key].description).trigger('autosize.resize');
                    newLineItem.find('[name*="rate"]').val(Number(unbilledTimeEntryLineItems[key].rate).toFixed(2));
                    newLineItem.find('[name*="quantity"]').val(Number(unbilledTimeEntryLineItems[key].quantity).toFixed(2));
                    newLineItem.find('[name*="line-total"]').val(lineTotal);

                    $(newLineItem).append('<input type="hidden" name="lineItems['+lineId+'][time_entry_ids]" value="'+ unbilledTimeEntryLineItems[key].time_entry_ids +'" />');
                }
            }

        }

    }

    function placeItemLineItems(unbilledItemLineItems){
        // Add unbilled expenses to invoice
        if (unbilledItemLineItems){
            for (var key in unbilledItemLineItems) {
                if (unbilledItemLineItems.hasOwnProperty(key)) {

                    var newLineItem = addLineItem('item');
                    var lineId = newLineItem.attr('data-line-id');

                    var lineTotal = numberWithCommas((unbilledItemLineItems[key].rate * unbilledItemLineItems[key].quantity).toFixed(2));

                    newLineItem.find('[name*="name"]').val(unbilledItemLineItems[key].name).trigger('autosize.resize');
                    newLineItem.find('[name*="notes"]').val(unbilledItemLineItems[key].description).trigger('autosize.resize');
                    newLineItem.find('[name*="rate"]').val(Number(unbilledItemLineItems[key].rate).toFixed(2));
                    newLineItem.find('[name*="quantity"]').val(Number(unbilledItemLineItems[key].quantity).toFixed(2));
                    newLineItem.find('[name*="line-total"]').val(lineTotal);

                    newLineItem.append('<input type="hidden" name="lineItems['+lineId+'][expense_ids]" value="'+ unbilledItemLineItems[key].expense_ids +'" />');
                }
            }
        }

    }


    function clearCustomerAddress(){
        $('#customerAddress').html('');
        $('#customerAddress').html('');
        $('#customerCity').html('');
        $('#customerState').html('');
        $('#customerPostalCode').html('');
    }


    function updateDiscount(subTotal){

        var discountPercentString = $('input[name=discount]').val() || 0;
        var discountMultiplier = parseFloat(discountPercentString) / 100.0;

        var discount = subTotal * discountMultiplier;

        $('#invoiceTotalTable .discount').html(currencyCodeHtml + numberWithCommas(discount.toFixed(2)));

        return discount;
    }

    function updateTotal(){

        var subTotal = updateSubtotal();
        var discount = updateDiscount(subTotal);

        var total = subTotal - discount;

        if (subTotal!=total){
            $('.subtotal-row, .discount-row').show();
        } else {
            $('.subtotal-row, .discount-row').hide();
        }

        $('#invoiceTotalTable .total').html(currencyCodeHtml + numberWithCommas(total.toFixed(2)));

    }

    function updateSubtotal(){

        var subTotal = 0;

        $('[name*="line-total"]').each(function(){

            var lineTotal = parseFloat($(this).val().replace(',','')) || 0;
            subTotal = subTotal + lineTotal;

        });

        $('#invoiceTotalTable .subtotal').html(currencyCodeHtml + numberWithCommas(subTotal.toFixed(2)));

        return subTotal;

    }

    // Autosize textareas as needed (dependent on autosize.js)
    $('textarea').autosize({
        append: false
    });

    // Don't allow focus in line total input
    $(document).on('focus', 'input[name*="line-total"]', function(){
        $(this).blur();
    });

    // Calculate line item & update totals http://stackoverflow.com/questions/8191064/jquery-on-function-for-future-elements-as-live-is-deprecated
    $(document).on('keyup', 'input.rate, input.quantity, input[name="discount"]', function(){

        var type        = ($(this).parent().parent().hasClass('time-entry')) ? 'time-entry' : 'item';
        var lineId      = $(this).parent().parent().data('line-id');
        var rate        = $('tr.'+type+'[data-line-id="' + lineId + '"] input[name="lineItems['+lineId+'][rate]"]').val() || 0;
        var quantity    = $('tr.'+type+'[data-line-id="' + lineId + '"] input[name="lineItems['+lineId+'][quantity]"]').val() || 0;

        var lineTotal   = rate * quantity;

        $('tr.'+type+'[data-line-id="' + lineId + '"] input[name="lineItems['+lineId+'][line-total]"]').val(numberWithCommas(lineTotal.toFixed(2)));

        updateTotal();


    });


    // Add Line Item on user button click
    $("#addItem, #addTimeEntry").on('click',function(){

        var type = ($(this).attr('id')=='addItem') ? 'item' : 'time-entry';
        addLineItem(type);

    });

    function addLineItem(type){

        var lastLineItem = $('tr.'+type).last();

        // If the items table has been displayed already, add a new line to it, otherwise just show and return it, and get outta heah
        if(lastLineItem.is(':hidden')){
            if (type=='item'){
                $('table.items').show();
            } else {
                $('table.time-entries').show();
            }

            return lastLineItem;
        }

        var oldLineId = lastLineItem.data('line-id');
        var newLineId = oldLineId+1;
        var newLineItem = lastLineItem.clone().attr('data-line-id', newLineId );

        // Change names to match new line ID and clear out old values, except the hidden inputs that contain the type
        newLineItem.find('[name*="lineItems['+ oldLineId+']"]').each(function(){
            this.name = this.name.replace(oldLineId, newLineId);  // Replace ID
            if (this.name.indexOf('[type]') == -1){
                this.value = '';
            }
            if (this.name.indexOf('_ids]') > -1){ // if old line item had time entry or expense ids attached, remove them from new line item
                this.remove();
            }

        });

        // Insert the new line
        newLineItem.insertAfter( lastLineItem );

        // Reestablish original size, and add them to be autosized
        newLineItem.find('textarea').css('height','40px').autosize({append:false});

        return newLineItem;
    }

    // Show delete x on hover
    $(document).on({
        mouseenter: function () {
            $(this).find('.delete-line-item button').show();
        },
        mouseleave: function () {
            $(this).find('.delete-line-item button').hide();
        }
    }, ".line-item");


    // Kill line item on x click
    $(document).on('click', '.delete-button', function(){

        var lineItem = $(this).parent().parent();

        removeLineItem(lineItem);

        updateTotal();

    });

    function removeLineItem(lineItem){

        if(lineItem.hasClass('time-entry')){
            if($('.line-item.time-entry').length==1){
                $('table.time-entries').hide();
            } else {
                lineItem.remove();
            }
        }

        if(lineItem.hasClass('item')){
            if($('.line-item.item').length==1){
                $('table.items').hide();
            } else {
                lineItem.remove();

            }
        }

        clearLineItemValues(lineItem);

    }

    function clearEmptyLineItems(){
        $('.line-item').each(function(){

            if ($(this).find('[name*="name"]').val()=='' && $(this).find('[name*="notes"]').val()=='' && $(this).find('[name*="rate"]').val()=='' && $(this).find('[name*="quantity"]').val()==''){
                removeLineItem($(this));
            }

        });
    }

    function clearLineItemValues(lineItem){
        lineItem.find('[name*="name"]').val('');
        lineItem.find('[name*="notes"]').val('');
        lineItem.find('[name*="rate"]').val('');
        lineItem.find('[name*="quantity"]').val('');
        lineItem.find('[name*="line-total"]').val('');
        lineItem.find('[name*="time_entry_ids"]').remove();
        lineItem.find('[name*="expense_ids"]').remove();
    }

    /* Line Item Format Options (modal) */

    $('.line-item-format-option .header').click(function(){

        var option = $(this).parent();

        $('.line-item-format-option .header').removeClass('selected').children('i.fa').removeClass('fa-check-circle').addClass('fa-check-circle-o');
        option.addClass('selected').find('i.fa').removeClass('fa-check-circle-o').addClass('fa-check-circle');

        if(option.hasClass('grouped') || option.hasClass('detailed')){
            option.find('.detail').slideDown('fast');
        }

    });

    // Actions when options inside "grouped" are clicked
    $('.tab-pane#grouped :checkbox').click(function(){
        var showOption = $(this).data('show-option');

        $('#grouped .line-item-format-preview .' + showOption).toggle();

        if($('#grouped .line-item-format-preview .date-range').is(':hidden') && $('#grouped .line-item-format-preview .project').is(':hidden')) {
            $('#grouped .brackets').hide();
        } else {
            $('#grouped .brackets').show();
        }

        if($('#grouped .line-item-format-preview .date-range').is(':visible') && $('#grouped .line-item-format-preview .project').is(':visible')) {
            $('#grouped .project-date-range-space').show();
        } else {
            $('#grouped .project-date-range-space').hide();
        }

    });

    // Actions when options inside "detailed" are clicked
    $('.tab-pane#detailed :checkbox').click(function(){

        var showOption = $(this).data('show-option');

        $('#detailed .line-item-format-preview .' + showOption).toggle();

        if($('#detailed .line-item-format-preview .entry-date').is(':hidden') && $('#detailed .line-item-format-preview .project').is(':hidden')) {
            $('#detailed .brackets').hide();
        } else {
            $('#detailed .brackets').show();
        }

        if($('#detailed .line-item-format-preview .entry-date').is(':visible') && $('#detailed .line-item-format-preview .project').is(':visible')) {
            $('#detailed .project-entry-date-space').show();
        } else {
            $('#detailed .project-entry-date-space').hide();
        }

        if ($('#detailed .line-item-format-preview .team-member').is(':visible') && $('#detailed .line-item-format-preview .notes').is(':visible')){

            $('#detailed .notes-colon').show();
        } else {

            $('#detailed .notes-colon').hide();
        }

    });


    /* Button to save invoice from top of screen */


    $( "#saveInvoiceForm" ).click(function() {
        $( "#invoiceForm").submit();
    });


    /* Log if user has typed in invoice number, if so, don't suggest any more */
    $('#number').keypress(function(){
        userEditedInvoiceNumber = true;
    });


    /* Logo & Dropzone stuff */

    Dropzone.options.logoDropzone = {
        paramName: "file", // The name that will be used to transfer the file
        maxFilesize: 2, // MB
        dictDefaultMessage: '<i class="fa fa-cloud-upload"></i> Add a Logo',
        previewTemplate: '<div class="dz-preview dz-file-preview">'+
        '<div class="dz-details">'+
        '<img class="dz-thumbnail" data-dz-thumbnail />'+
        '</div>'+
        '<div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>'+
        '<div class="text-left dz-custom-error"></div>'+
        '</div>',
        thumbnailWidth: null,
        thumbnailHeight: null,

        init: function() {
            this.on("addedfile", function(file) {

                $('.invoice-edit .dropzone').addClass('with-preview');

                $('.remove-logo').fadeIn('fast');

                $('.dz-default.dz-message').hide();

                // Prevents multiple file uploads displaying
                if (this.files[1]!=null){
                    this.removeFile(this.files[0]);
                }

            });

            this.on("success", function(file, response) {
                $('#logo_filename').val(response.logo_filename);
            });

            this.on("error", function(file) {
                $('.dz-thumbnail').hide();
                console.log('hi');
                $('.dz-custom-error').html('We were unable to upload your file. Please make sure you\'re uploading a valid image less than 1MB.');
                //this.removeAllFiles(true);
            });
        }
    };

    $('.remove-logo').click(function(){

        $(this).fadeOut('fast');
        $('#logo_filename').val('');


        $('.dz-custom-error').html('').hide();
        $('.invoice-logo-img-container').fadeOut('fast', function(){
            $('#logoDropzone').fadeIn('fast');
        });

        $('.dz-thumbnail').fadeOut('fast', function(){
            $('.invoice-edit .dropzone').removeClass('with-preview');
            $('.dz-default').fadeIn('fast');
        });

    });

    $( "table.time-entries tbody, table.items tbody" ).sortable();


});