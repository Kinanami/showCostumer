var username = 'IPA_APPL';
var password = 'ipa4nicole';
var json_search = '';
var json_getDetail = '';
var result_count = '';
var v_active_id = "";


function search() {

  var error_message = '';
  var ex_gp = document.getElementById('input_GP').value;
  var ex_Name1 = document.getElementById('input_Name1').value;
  var ex_Name2 = document.getElementById('input_Name2').value;
  var ex_GPType = document.getElementById('inputGP_Type').value;
  var ex_Street = document.getElementById('input_Street').value;
  var ex_HouseNo = document.getElementById('input_HouseNo').value;
  var ex_PLZ = document.getElementById('input_PLZ').value;
  var ex_city = document.getElementById('input_city').value;




  $.soap({
    url: 'http://sappot101.wwz.local:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=WEB_T&receiverParty=&receiverService=&interface=ssBP_Search&interfaceNamespace=http://wwz.ch/S/99980/BP_Search',
    method: 'bp:BP_SearchRequest',
    noPrefix: true,
    appendMethodToURL: false,
    namespaceQualifier: 'bp',
    namespaceURL: 'http://wwz.ch/S/99980/BP_Search',
    timeout: 5000,

    data: {
      GP_No: ex_gp,
      Name_1: ex_Name1,
      Name_2: ex_Name2,
      GP_Type: ex_GPType,
      Street: ex_Street,
      House_no: ex_HouseNo,
      PLZ: ex_PLZ,
      City: ex_city
    },

    HTTPHeaders: {
      Authorization: 'Basic ' + btoa(username + ':' + password)
    },

    envAttributes: {
      'xmlns:bp': 'http://wwz.ch/S/99980/BP_Search'
    },

    success: function(soapResponse) {
      var IM_GPNo = "";
      var IM_Name1 = "";
      var IM_Name2 = "";
      var IM_GPType = "";

      json_search = soapResponse.toJSON();
      result_count = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Result_Count['#text'];
      $("#t_search").empty();

      if (result_count > 1) {
        Object.keys(json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details).forEach(function(key) {

          IM_GPNo = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].GP_No['#text'];

          if (json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].Name_1) {
            IM_Name1 = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].Name_1['#text'];
          }

          if (json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].Name_2) {
            IM_Name2 = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].Name_2['#text'];
          }

          var IM_GPType = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].GP_Type['#text'];
          $("#t_search").append('<tr id = ' + key + ' onclick="set_selected_GP(this.id);"> <td>' + IM_GPNo + '</td> <td>' + IM_Name1 + '</td> <td>' + IM_Name2 + '</td></tr>');
        });
        $('#selection_modal').modal('show');


      } else if (result_count == 1) { // // COMBAK: Dirket mit der Suche starten - kein Model öffnen
        IM_GPNo = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details.GP_No['#text'];

        getDetails(IM_GPNo);
        $('#show_GP_Details').collapse('add');


      } else {
        error_message = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Message.Message_Text['#text'];
        // IDEA: Functin für Fehlerausgabe im Conten
      }
    },

    error: function(SOAPResponse) {
      error_message = 'Beim verarbeiten der Anfrage ist einfehler aufgetreten';
      // IDEA: Functin für Fehlerausgabe im Conten
    }
  });
}


function getDetails(selected_gp) {
  var v_name1 = "";
  var v_name2 = "";
  var v_title = "";
  var v_street = "";
  var v_plz = "";
  var v_city = "";
  var v_region = "";
  var v_tel_no = "";
  var v_mail_adress = "";

  var ex_gp = selected_gp;

  $.soap({

    url: 'http://sappot101.wwz.local:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=WEB_T&receiverParty=&receiverService=&interface=ssBP_GetDetails&interfaceNamespace=http://wwz.ch/S/99981/BP_GetDetails',
    method: 'bp:BP_GetDetailsRequest',
    noPrefix: true,
    appendMethodToURL: false,
    namespaceQualifier: 'bp',
    namespaceURL: 'http://wwz.ch/S/99981/BP_GetDetails',
    timeout: 5000,

    data: {
      GP_No: ex_gp,

    },
    HTTPHeaders: {
      Authorization: 'Basic ' + btoa(username + ':' + password)
    },

    success: function(soapResponse) {
      $("#t_details").empty();

      json_getDetail = soapResponse.toJSON();
      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Title) {
        v_title = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Title['#text'];

        $('#t_details').append('<tr><td>Anrede</td><td>' + v_title + '</td></tr>');
      }

      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].GP_Type['#text'] == 1) {

        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1) {
          v_name1 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1['#text'];

          $('#t_details').append('<tr><td>Nachname</td><td>' + v_name1 + '</td></tr>');
        }

        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2) {
          v_name2 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2['#text'];

          $('#t_details').append('<tr><td>Vorname</td><td>' + v_name2 + '</td></tr>');
        }

      } else {
        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1) {
          v_name1 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1['#text'];

          $('#t_details').append('<tr><td>Name</td><td>' + v_name1 + '</td></tr>');
        }

        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2) {
          v_name2 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2['#text'];

          $('#t_details').append('<tr><td>Namenszusatz</td><td>' + v_name2 + '</td></tr>');
        }
      }

      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Street) {
        v_street = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Street['#text'];

        $('#t_details').append('<tr><td>Strasse</td><td>' + v_street + '</td></tr>');
      }

      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].PLZ) {
        v_plz = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].PLZ['#text'];

        $('#t_details').append('<tr><td>PLZ</td><td>' + v_plz + '</td></tr>');
      }

      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].City) {
        v_city = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].City['#text'];

        $('#t_details').append('<tr><td>Stadt</td><td>' + v_city + '</td></tr>');
      }

      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Region) {
        v_region = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Region['#text'];

        $('#t_details').append('<tr><td>Region</td><td>' + v_region + '</td></tr>');
      }

      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Country) {
        v_country = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Country['#text'];

        $('#t_details').append('<tr><td>Land</td><td>' + v_country + '</td></tr>');
      }


      //


      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Count['#text'] == 1) {


        v_tel_no = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail.Tel_No['#text'];
        $('#t_details').append('<tr><td>Telefon</td><td>' + v_tel_no + '</td></tr>');

      } else if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Count['#text'] > 1) {

        Object.keys(json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail).forEach(function(key) {
          v_tel_no = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail[key].Tel_No['#text'];
          if (key > 0) {
            $('#t_details').append('<tr><td></td><td>' + v_tel_no + '</td></tr>');
          } else {
            $('#t_details').append('<tr><td>Telefon</td><td>' + v_tel_no + '</td></tr>');
          }


        });
      }



      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Count['#text'] == 1) {


        v_mail_adress = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail.E_Mail_Adress['#text'];
        $('#t_details').append('<tr><td>E-Mail</td><td>' + v_mail_adress + '</td></tr>');

      } else if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Count['#text'] > 1) {

        Object.keys(json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail).forEach(function(key) {
          v_mail_adress = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail[key].E_Mail_Adress['#text'];
          if (key > 0) {
            $('#t_details').append('<tr><td></td><td>' + v_mail_adress + '</td></tr>');
          } else {
            $('#t_details').append('<tr><td>E-Mail</td><td>' + v_mail_adress + '</td></tr>');
          }

        });
      }

    },

    error: function(soapResponse) {
      error_message = 'Beim verarbeiten der Anfrage ist einfehler aufgetreten';
      // IDEA: Functin für Fehlerausgabe im Conten
    },
  });









}


function checkSearchForm() {
  var Fehler = "";
  var Fehler_Message = "";

  if (document.forms.SearchForm.input_GP.value.length > 0 && document.forms.SearchForm.input_GP.value.length < 7) {
    Fehler = "X";
    Fehler_Message = "<li>Die länge der Geschäftspartnernummer ist zu kurz. Die Nummer muss 7-Zeichen lang sein.</li>";
    document.getElementById('div_i_gp').classList.add('has-error');


  }

  if (document.forms.SearchForm.input_GP.value == "" && document.forms.SearchForm.input_Name2.value == "" &&
    document.forms.SearchForm.input_Name1.value == "" && document.forms.SearchForm.input_Street.value == "" &&
    document.forms.SearchForm.input_HouseNo.value == "" && document.forms.SearchForm.input_city.value == "" &&
    document.forms.SearchForm.input_PLZ.value == "") {
    Fehler = "X";
    Fehler_Message = Fehler_Message + "<li>Mindestens ein Feld muss ausgefüllt werden.</li>";
    document.getElementById('From_search').classList.add('has-error');

  }
  if (Fehler == "X") {
    Fehler_Message = "<ul style='list-style-type:disc'>" + Fehler_Message + "</ul>";
    var error_message = document.createElement("DIV");
    error_message.classList.add('alert');
    error_message.classList.add('alert-danger');
    var error_message_text = document.createTextNode(Fehler_Message);
    error_message.appendChild(error_message_text);
    //document.container.appendChild(error_message);

  } else {
    search();
  }
}

function set_selected_GP(selected_id) {

  if (v_active_id != '') {
    document.getElementById(v_active_id).classList.remove("info");
  }

  document.getElementById(selected_id).classList.add("info");
  v_active_id = selected_id;

  v_active_gp = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[v_active_id].GP_No['#text'];
}
