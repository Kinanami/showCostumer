var username = 'IPA_APPL';
var password = 'ipa4nicole';
var json_search = '';
var json_getDetail = '';
var json_QMC = "";
var result_count = '';
var v_active_id = "";
var v_active_gp = "";



function ssBPSearch() { // Funktion zum ausführen des Webservice BP_Search und ausgabe der gefuden GPs

  var error_message = '';
  // Inputfelder inhalt an Variabeln übergeben
  var ex_gp = document.getElementById('input_GP').value;
  var ex_Name1 = document.getElementById('input_Name1').value;
  var ex_Name2 = document.getElementById('input_Name2').value;
  var ex_GPType = document.getElementById('inputGP_Type').value;
  var ex_Street = document.getElementById('input_Street').value;
  var ex_HouseNo = document.getElementById('input_HouseNo').value;
  var ex_PLZ = document.getElementById('input_PLZ').value;
  var ex_city = document.getElementById('input_city').value;

  $.soap({ // Aufruf des Webservice BP_Search
    url: 'http://sappot101.wwz.local:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=WEB_T&receiverParty=&receiverService=&interface=ssBP_Search&interfaceNamespace=http://wwz.ch/S/99980/BP_Search',
    method: 'bp:BP_SearchRequest',
    noPrefix: true,
    appendMethodToURL: false,
    namespaceQualifier: 'bp',
    namespaceURL: 'http://wwz.ch/S/99980/BP_Search',
    timeout: 5000,

    data: { // Übergabe der der Suchkrietrein an den Webservice
      GP_No: ex_gp,
      Name_1: ex_Name1,
      Name_2: ex_Name2,
      GP_Type: ex_GPType,
      Street: ex_Street,
      House_no: ex_HouseNo,
      PLZ: ex_PLZ,
      City: ex_city
    },

    HTTPHeaders: { // Zugang für den Webservivce ins SAP System
      Authorization: 'Basic ' + btoa(username + ':' + password)
    },

    envAttributes: {
      'xmlns:bp': 'http://wwz.ch/S/99980/BP_Search'
    },
    // Bei erfolfreichem Webservice
    success: function(soapResponse) {
      var IM_GPNo = "";
      var IM_Name1 = "";
      var IM_Name2 = "";
      var IM_GPType = "";

      json_search = soapResponse.toJSON(); // Responsenachricht in JSON Convertieren
      result_count = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Result_Count['#text']; // Anuahl gefundener GPs auslesen
      $("#t_search").empty();
      $("#modal_error").html("");
      $("#modal_error").removeClass("alert alert-danger");
      v_active_id = "";

      if (result_count > 1) { // Falls mehr als GP gfunden wurde : Daten werden aufbereitet und in einer HTML Tabelle hinzugefügt

        Object.keys(json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details).forEach(function(key) {
          if (key < 50) { // Ab dem 50isten GP eine Benachrichtung ausgeben
            IM_GPNo = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].GP_No['#text'];

            if (json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].Name_1) {
              IM_Name1 = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].Name_1['#text'];
            }

            if (json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].Name_2) {
              IM_Name2 = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].Name_2['#text'];
            }

            var IM_GPType = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].GP_Type['#text'];
            $("#t_search").append('<tr id = ' + key + ' onclick="set_selected_GP(this.id);"> <td>' + IM_GPNo + '</td> <td>' + IM_Name1 + '</td> <td>' + IM_Name2 + '</td></tr>');
          } else {

            $("#modal_error").html("<strong>Es wurden mehr als 50 Geschäftspartner gefunden</strong> Schrenken sie die Suche ein, um ein besseres ergbenbiss zu erhaleten.");
            $("#modal_error").addClass("alert alert-danger");
            return;

          }
        });
        $('#selection_modal').modal('show');

      } else if (result_count == 1) { // Fall 1 GP gefunden --- dircket weite mit dem auslesen der GP informtionen : getdetails()
        IM_GPNo = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details.GP_No['#text'];
        v_active_gp = IM_GPNo;
        getDetails(v_active_gp);



      } else if (result_count == 0) { // Fals kein GP gefunden : Fehlermeldung ausgeben
        error_message = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Message.Message_Text['#text'];
        $("#error_search").html(error_message);
        $("#error_search").addClass("alert alert-danger");
      }

    },

    error: function(SOAPResponse) { // Fehler während der ausführung des Webservive : Fehlermeldun ausgeeben
      error_message = 'Beim verarbeiten der Anfrage ist einfehler aufgetreten';
      $("#error_search").html(error_message);
      $("#error_search").addClass("alert alert-danger");
    }
  });
}

// Funktion zum ausführen des Webservice BP_GetDetails
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
  $('#selection_modal').modal('hide');
  $('#show_GP_Details').collapse('show');
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

    success: function(soapResponse) { // Webservice erfolgreich
      $("#t_details").empty(); // Leeren der Tabelle für die GP Informationen jedes mal wen neue Daten gesucht werden

      json_getDetail = soapResponse.toJSON(); // Response konvertieren in JSON
      if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Message.Message_Type['#text'] == "S") { // überprüfen ob auslesen der Daten erfolgreich
        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Title) { // Falls Anrede vorhanden
          v_title = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Title['#text'];

          $('#t_details').append('<tr><td>Anrede</td><td>' + v_title + '</td></tr>'); // Anrede in Tabelle schreiben
        }

        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].GP_Type['#text'] == 1) { // Fals GP ist Provatperson

          if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1) { // Falls namen 1 vorhanden
            v_name1 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1['#text'];
            $('#t_details').append('<tr><td>Nachname</td><td>' + v_name1 + '</td></tr>'); // Name in Tabelle schreiben
          }

          if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2) { // Fals NAme 2 vorhanden
            v_name2 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2['#text'];

            $('#t_details').append('<tr><td>Vorname</td><td>' + v_name2 + '</td></tr>'); // Name 2 in Tabelle schreiben
          }

        } else {
          if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1) { // Falls namen 1 vorhanden
            v_name1 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1['#text'];

            $('#t_details').append('<tr><td>Name</td><td>' + v_name1 + '</td></tr>');// Name in Tabelle schreiben
          }

          if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2) {// Fals NAme 2 vorhanden
            v_name2 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2['#text'];

            $('#t_details').append('<tr><td>Namenszusatz</td><td>' + v_name2 + '</td></tr>'); // Name 2 in Tabelle schreiben
          }
        }

        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Street) { // Fals Strasse vohanden
          v_street = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Street['#text'];

          $('#t_details').append('<tr><td>Strasse</td><td>' + v_street + '</td></tr>'); // Strasse in Tabelle schreiben
        }

        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].PLZ) { // Fals PLZ vorhanden
          v_plz = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].PLZ['#text'];

          $('#t_details').append('<tr><td>PLZ</td><td>' + v_plz + '</td></tr>'); // PLZ in Tabelle schreiben
        }

        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].City) { // Fals Stadt vorhanden
          v_city = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].City['#text'];

          $('#t_details').append('<tr><td>Stadt</td><td>' + v_city + '</td></tr>'); // Stadt in Tabelle schreiben
        }

        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Region) { // Fals Region vorhanden
          v_region = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Region['#text'];

          $('#t_details').append('<tr><td>Region</td><td>' + v_region + '</td></tr>'); // Region in Tabelle schreiben
        }

        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Country) { // Fals Land vorhanden
          v_country = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Country['#text'];

          $('#t_details').append('<tr><td>Land</td><td>' + v_country + '</td></tr>'); // Land in TAbelle schreiben
        }


        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Count['#text'] == 1)  // Fals nur eine Telefonnummer


          v_tel_no = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail.Tel_No['#text'];
          $('#t_details').append('<tr><td>Telefon</td><td>' + v_tel_no + '</td></tr>'); // Telefonnummer in Tabelle schreiben

        } else if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Count['#text'] > 1) { // Fals mehrere Nummern vorhanden

          Object.keys(json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail).forEach(function(key) { // Für jede nummer werte in Tabelle schreiben
            v_tel_no = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail[key].Tel_No['#text'];
            if (key > 0) {
              $('#t_details').append('<tr><td></td><td>' + v_tel_no + '</td></tr>');
            } else {
              $('#t_details').append('<tr><td>Telefon</td><td>' + v_tel_no + '</td></tr>');
            }


          });
        }



        if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Count['#text'] == 1) { // Falls eine Mail vorhandne


          v_mail_adress = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail.E_Mail_Adress['#text'];
          $('#t_details').append('<tr><td>E-Mail</td><td>' + v_mail_adress + '</td></tr>'); // Mail in tabelle schreiben

        } else if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Count['#text'] > 1) { // Fals mehrere E-Mails vorhanden

          Object.keys(json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail).forEach(function(key) { // Für jede Mail wert in Tabelle schreiben
            v_mail_adress = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail[key].E_Mail_Adress['#text'];
            if (key > 0) {
              $('#t_details').append('<tr><td></td><td>' + v_mail_adress + '</td></tr>');
            } else {
              $('#t_details').append('<tr><td>E-Mail</td><td>' + v_mail_adress + '</td></tr>');
            }

          });


        }
        $('#t_details').append('<tr><td><button class="btn btn-primary" type="button" onclick="openChangeModus(v_active_gp)">Ändern</button></td></tr>'); // Button für Änderungsmodus in letzte Tabellenzeile
        $("#error_getDetails").html(); // Fals zuvor Fehlermdeldung ausgegeb : jetzt entfenen
        $("#error_getDetails").removeClass("alert alert-danger");
        getQMCProducts(v_active_gp); // QMC IDs auslesen 
      } else {
        error_message = 'Beim verarbeiten der Anfrage ist einfehler aufgetreten';
        $("#error_getDetails").html(error_message);
        $("#error_getDetails").addClass("alert alert-danger");
      }
    },

    error: function(soapResponse) {
      error_message = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Message.Message_Text['#text'];
      $("#error_getDetails").html(error_message);
      $("#error_getDetails").addClass("alert alert-danger");
    },
  });
}
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


function getQMCProducts(selected_gp) {
  // var v_name1 = "";
  // var v_name2 = "";
  // var v_title = "";
  // var v_street = "";
  // var v_plz = "";
  // var v_city = "";
  // var v_region = "";
  // var v_tel_no = "";
  // var v_mail_adress = "";
  //
  var ex_gp = selected_gp;
  //
  $.soap({

    url: 'http://sappot101.wwz.local:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=WEB_T&receiverParty=&receiverService=&interface=ssBP_QMCProducts&interfaceNamespace=http://wwz.ch/S/99982/BP_QMCProducts',
    method: 'bp:BP_QMCProductsRequest',
    noPrefix: true,
    appendMethodToURL: false,
    namespaceQualifier: 'bp',
    namespaceURL: 'http://wwz.ch/S/99982/BP_QMCProducts',
    timeout: 5000,

    data: {
      GP_No: ex_gp,

    },
    HTTPHeaders: {
      Authorization: 'Basic ' + btoa(username + ':' + password)
    },

    success: function(soapResponse) {

      $("#t_qmc").empty();
      $("#d_qmc_selction").empty();

      json_QMC = soapResponse.toJSON();

      if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.Result_Count['#text'] == 1) {

        v_qmc_id = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.QMC_ID['#text'];
        $('#t_qmc').append('<tr><td>QMC ID</td><td>' + v_qmc_id + '</td></tr>');

        if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Telephone_Product) {
          v_tel_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Telephone_Product['#text'];

          $('#t_qmc').append('<tr><td>Fix-Telefon</td><td>' + v_tel_pro + '</td></tr>');
        }

        if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Mobile_Product) {
          v_mobile_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Mobile_Product['#text'];

          $('#t_qmc').append('<tr><td>Mobile</td><td>' + v_mobile_pro + '</td></tr>');
        }

        if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Internet_Product) {
          v_inter_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Internet_Product['#text'];

          $('#t_qmc').append('<tr><td>internet</td><td>' + v_inter_pro + '</td></tr>');
        }

        if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.DTV) {
          v_dtv_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.DTV['#text'];

          $('#t_qmc').append('<tr><td>DTV</td><td>' + v_dtv_pro + '</td></tr>');
        }

        if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Verte) {
          v_verte_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Verte['#text'];

          $('#t_qmc').append('<tr><td>Verte</td><td>' + v_verte_pro + '</td></tr>');
        }

        if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.QL_TV) {
          v_qltv_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.QL_TV['#text'];

          $('#t_qmc').append('<tr><td>QLTV</td><td>' + v_qltv_pro + '</td></tr>');
        }

        if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Combi_Product) {
          v_kombi_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details.Combi_Product['#text'];

          $('#t_qmc').append('<tr><td>Kombi</td><td>' + v_kombi_pro + '</td></tr>');
        }

      } else if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.Result_Count['#text'] > 1) {



        $('#d_qmc_selction').append('<select class="form-control"  id="select_qmc" onchange="changeQMCData(this.value)"></select>');


        Object.keys(json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details).forEach(function(key) {
          v_qmc_id = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[key].QMC_ID['#text'];
          $('#select_qmc').append('<option value="' + key + '"> ' + v_qmc_id);

        });

      } else {

        v_message = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].Message.Message_Text['#text'];
        $('#error_QMC').append(v_message);

      }

    },


    error: function(soapResponse) {
      error_message = 'Beim verarbeiten der QMC IDs ist ein Fehler aufgetreten (Webservice BP_QMCProducts)';
      $("#error_QMC").html(error_message);
      $("#error_QMC").addClass("alert alert-danger");
    },
  });

}

// Funktion zum überprüfen der Felder
function checkSearchForm() {
  var error = ""; // Hilfsvariabel : wird gesetzt sobald ein eingabe nicht in ordnung ist
  var error_Message = "";
// GP Wert = 1, 2, 3, 4, 5 oder 6?
  if (document.forms.SearchForm.input_GP.value.length > 0 && document.forms.SearchForm.input_GP.value.length < 7) { //
    error = "X";
    error_Message = "Die länge der Geschäftspartnernummer ist zu kurz. Die Nummer muss 7-Zeichen lang sein.";
    document.getElementById('div_i_gp').classList.add('has-error'); // klasse hinzufügen für rotes Inputfeld
  } // Überprüfung ob ein Feld ausgefüllt
  else if (document.forms.SearchForm.input_GP.value == "" && document.forms.SearchForm.input_Name2.value == "" &&
    document.forms.SearchForm.input_Name1.value == "" && document.forms.SearchForm.input_Street.value == "" &&
    document.forms.SearchForm.input_HouseNo.value == "" && document.forms.SearchForm.input_city.value == "" &&
    document.forms.SearchForm.input_PLZ.value == "") {
    error = "X";
    error_Message = error_Message + "Mindestens ein Feld muss ausgefüllt werden.";
    document.getElementById('From_search').classList.add('has-error'); // klasse hinzufügen für rotes Inputfeld
  }
  // Überprüfen ob ein inkorekte eingabe gefunden wurde
  if (error == "X") {
    $("#error_search").html(error_Message); // fehlermedung im vorgesehnen Div ausgeben
    $("#error_search").addClass("alert alert-danger"); // klasse hinzufügen für rotes Inputfeld

  } else {
    document.getElementById('div_i_gp').classList.remove('has-error');
    document.getElementById('From_search').classList.remove('has-error');
    $("#error_search").html(""); // Fehlermeldungen entfernen fals vorhanden
    $("#error_search").removeClass("alert alert-danger");
    ssBPSearch(); // Webservice staren
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


function changeQMCData(meineID) { // json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[0].QMC_ID['#text']

  $("#t_qmc").empty();

  v_qmc_id = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].QMC_ID['#text'];
  $('#t_qmc').append('<tr><td>QMC ID</td><td>' + v_qmc_id + '</td></tr>');

  if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Telephone_Product) {
    v_tel_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Telephone_Product['#text'];

    $('#t_qmc').append('<tr><td>Fix-Telefon</td><td>' + v_tel_pro + '</td></tr>');
  }

  if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Mobile_Product) {
    v_mobile_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Mobile_Product['#text'];

    $('#t_qmc').append('<tr><td>Mobile</td><td>' + v_mobile_pro + '</td></tr>');
  }

  if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Internet_Product) {
    v_inter_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Internet_Product['#text'];

    $('#t_qmc').append('<tr><td>internet</td><td>' + v_inter_pro + '</td></tr>');
  }

  if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].DTV) {
    v_dtv_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].DTV['#text'];

    $('#t_qmc').append('<tr><td>DTV</td><td>' + v_dtv_pro + '</td></tr>');
  }

  if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Verte) {
    v_verte_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Verte['#text'];

    $('#t_qmc').append('<tr><td>Verte</td><td>' + v_verte_pro + '</td></tr>');
  }

  if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].QL_TV) {
    v_qltv_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].QL_TV['#text'];

    $('#t_qmc').append('<tr><td>QLTV</td><td>' + v_qltv_pro + '</td></tr>');
  }

  if (json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Combi_Product) {
    v_kombi_pro = json_QMC['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_QMCProductsResponse'].QMC_List.QMC_Details[meineID].Combi_Product['#text'];

    $('#t_qmc').append('<tr><td>Kombi</td><td>' + v_kombi_pro + '</td></tr>');
  }
}


function openChangeModus(change_id) {
  $("#form_changeData").empty();
  if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].GP_Type['#text'] == 1) {
    if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Title) {
      v_title = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Title['#text'];
      // TODO: Anrede wie?
      switch (v_title) {
        case "Frau":
          $('#form_changeData').append('<div class="form-group row"><label  class="col-sm-4 col-form-label" for="select_title">Anrede</label>	<div class="col-sm-8"><select id="select_title" class="form-control"><option selected="selcted" value = "FRAU">Frau</option><option value= "HERR">Herr</option><option value= "HERR U. FRAU">Herr u. Frau</option><option value = "FRAUEN">Frauen</option><option value = "HERREN">Herren</option></select></div>');
          break;
        case "Herr":
          $('#form_changeData').append('<div class="form-group row"><label  class="col-sm-4 col-form-label" for="select_title">Anrede</label>	<div class="col-sm-8"><select id="select_title" class="form-control"><option  value = "FRAU">Frau</option><option selected="selcted" value= "HERR">Herr</option><option value= "HERR U. FRAU">Herr u. Frau</option><option value = "FRAUEN">Frauen</option><option value = "HERREN">Herren</option></select></div>');
          break;
        case "Herr u. Frau":
          $('#form_changeData').append('<div class="form-group row"><label  class="col-sm-4 col-form-label" for="select_title">Anrede</label>	<div class="col-sm-8"><select id="select_title" class="form-control"><option  value = "FRAU">Frau</option><option value= "HERR">Herr</option><option selected="selcted" value= "HERR U. FRAU">Herr u. Frau</option><option value = "FRAUEN">Frauen</option><option value = "HERREN">Herren</option></select></div>');
          break;
        case "Frauen":
          $('#form_changeData').append('<div class="form-group row"><label  class="col-sm-4 col-form-label" for="select_title">Anrede</label>	<div class="col-sm-8"><select id="select_title" class="form-control"><option  value = "FRAU">Frau</option><option value= "HERR">Herr</option><option value= "HERR U. FRAU">Herr u. Frau</option><option selected="selcted" value = "FRAUEN">Frauen</option><option value = "HERREN">Herren</option></select></div>');
          break;
        case "Herren":
          $('#form_changeData').append('<div class="form-group row"><label  class="col-sm-4 col-form-label" for="select_title">Anrede</label>	<div class="col-sm-8"><select id="select_title" class="form-control"><option  value = "FRAU">Frau</option><option value= "HERR">Herr</option><option value= "HERR U. FRAU">Herr u. Frau</option><option value = "FRAUEN">Frauen</option><option selected="selcted" value = "HERREN">Herren</option></select></div>');
          break;
      }
    }

    if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1) {
      v_name1 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1['#text'];

      $('#form_changeData').append('<div class="form-group row"><label for="inputTitle" class="col-sm-4 col-form-label">Nachname</label><div class="col-sm-8"><input type="text" class="form-control" id="inputName1" placeholder="' + v_name1 + '"></div></div>');
    }

    if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2) {
      v_name2 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2['#text'];

      $('#form_changeData').append('<div class="form-group row"><label for="inputName2" class="col-sm-4 col-form-label">Vorname</label><div class="col-sm-8"><input type="text" class="form-control" id="inputName2" placeholder="' + v_name2 + '"></div></div>');
    }
  } else {
    if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1) {
      v_name1 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_1['#text'];

      $('#form_changeData').append('<div class="form-group row"><label for="inputTitle" class="col-sm-4 col-form-label">Name 1</label><div class="col-sm-8"><input type="text" class="form-control" id="inputName1" placeholder="' + v_name1 + '"></div></div>');
    }

    if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2) {
      v_name2 = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Name_2['#text'];

      $('#form_changeData').append('<div class="form-group row"><label for="inputName2" class="col-sm-4 col-form-label">Namenzusatz</label><div class="col-sm-8"><input type="text" class="form-control" id="inputName2" placeholder="' + v_name2 + '"></div></div>');
    }
  }

  if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Count['#text'] == 1) {
    v_tel_no = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail.Tel_No['#text'];
    v_tel_id = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail.Tel_ID['#text'];
    $('#form_changeData').append('<div class="form-group row"><label for="' + v_tel_no + '" class="col-sm-4 col-form-label">Telefon</label><div id="div_t' + v_tel_id + '" class="col-sm-8"><input type="text" class="form-control" id="tel' + v_tel_id + '" placeholder="' + v_tel_no + '"></div></div>');
  } else if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Count['#text'] > 1) {

    Object.keys(json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail).forEach(function(key) {
      v_tel_no = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail[key].Tel_No['#text'];
      v_tel_id = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail[key].Tel_ID['#text'];
      $('#form_changeData').append('<div class="form-group row"><label for="' + v_tel_no + '" class="col-sm-4 col-form-label">Telefon</label><div id="div_t' + v_tel_id + '" class="col-sm-8"><input type="text" class="form-control" id="tel' + v_tel_id + '" placeholder="' + v_tel_no + '"></div></div>');
    });
  }

  if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Count['#text'] == 1) {


    v_mail_adress = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail.E_Mail_Adress['#text'];
    v_mail_id = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail.E_Mail_ID['#text'];
    $('#form_changeData').append('<div class="form-group row"><label for="' + v_mail_id + '" class="col-sm-4 col-form-label">E-Mail</label><div id="div_m' + v_mail_id + '" class="col-sm-8"><input type="text" class="form-control" id="mail' + v_mail_id + '" placeholder="' + v_mail_adress + '"></div></div>');

  } else if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Count['#text'] > 1) {

    Object.keys(json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail).forEach(function(key) {
      v_mail_adress = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail[key].E_Mail_Adress['#text'];
      v_mail_id = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail[key].E_Mail_ID['#text'];
      $('#form_changeData').append('<div class="form-group row"><label for="' + v_mail_id + '" class="col-sm-4 col-form-label">E-Mail</label><div id="div_m' + v_mail_id + '" class="col-sm-8"><input type="text" class="form-control" id="mail' + v_mail_id + '" placeholder="' + v_mail_adress + '"></div></div>');

    });
  }

  $('#change_modal').modal('show');
}



function ssBP_Update() {
  var xml = [];
  var v_change_title = document.getElementById("select_title").value;
  var v_change_name1 = document.getElementById("inputName1").value;
  var v_change_name2 = document.getElementById("inputName2").value;

  xml.push('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:bp="http://wwz.ch/S/99983/BP_Update">');
  xml.push('<soapenv:Header/>');
  xml.push('<soapenv:Body>');
  xml.push('<bp:BP_UpdateRequest>');
  xml.push('<GP_No>' + v_active_gp + '</GP_No>');
  xml.push('<Title>' + v_change_title + '</Title>');
  xml.push('<Name_1>' + v_change_name1 + '</Name_1>');
  xml.push('<Name_2>' + v_change_name2 + '</Name_2>');


  if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Count['#text'] == 1) {
    var input_tel_id = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail.Tel_ID['#text'];
    var v_change_tel_no = document.getElementById("input_tel_id").value;
    var v_change_tel_id = document.getElementById("input_tel_id").id;

    xml.push('<Tel_Change_List><Tel_Change_Detail><Tel_Number>' + v_change_tel_no + '</Tel_Number><Tel_ID>' + v_change_tel_id + '</Tel_ID></Tel_Change_Detail></Tel_Change_List>');

  } else if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Count['#text'] > 1) {
    xml.push('<Tel_Change_List>');
    Object.keys(json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail).forEach(function(key) {
      var v_change_tel_id = 'tel' + json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].Tel_List.Tel_Detail[key].Tel_ID['#text'];

      var v_change_tel_no = document.getElementById(v_change_tel_id).value;
      if (v_change_tel_no != "") {
        xml.push('<Tel_Change_Detail><Tel_Number>' + v_change_tel_no + '</Tel_Number><Tel_ID>' + v_change_tel_id + '</Tel_ID></Tel_Change_Detail>');
      }
    });
    xml.push('</Tel_Change_List>');
  }

  //--------------------------------------------------------------------------------------------------------------------

  if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Count['#text'] == 1) {
    var input_mail_id = json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail.E_Mail_ID['#text'];
    var v_change_mail_no = document.getElementById("input_mail_id").value;
    var v_change_mail_id = document.getElementById("input_mail_id").id;

    xml.push('<E_Mail_Change_List><E_Mail_Detail><E_Mail_Adress>' + v_change_mail_no + '</E_Mail_Adress></E_Mail_Adress>' + v_change_mail_id + '</E_Mail_ID></E_Mail_Detail></E_Mail_Change_List>');

  } else if (json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Count['#text'] > 1) {
    xml.push('<E_Mail_Change_List>');
    Object.keys(json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail).forEach(function(key) {
      v_change_mail_id = 'mail' + json_getDetail['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_GetDetailsResponse'].E_Mail_List.E_Mail_Detail[key].E_Mail_ID['#text'];
      var v_change_mail_no = document.getElementById(v_change_mail_id).value;
      if (v_change_mail_no != "") {

        xml.push('<E_Mail_Detail><E_Mail_Adress>' + v_change_mail_no + '</E_Mail_Adress><E_Mail_ID>' + v_change_mail_id + '</E_Mail_ID></E_Mail_Detail>');
      }
    });
    xml.push('</E_Mail_Change_List>');
  }

  xml.push('</bp:BP_UpdateRequest>');
  xml.push('</soapenv:Body>');
  xml.push('</soapenv:Envelope>');


  $.soap({
    url: 'http://sappot101.wwz.local:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=WEB_T&receiverParty=&receiverService=&interface=ssBP_Update&interfaceNamespace=http://wwz.ch/S/99983/BP_Update',
    method: 'bp:BP_UpdateRequest',
    noPrefix: false,
    appendMethodToURL: false,
    namespaceQualifier: 'bp',
    namespaceURL: 'http://wwz.ch/S/99983/BP_Update',

    data: xml.join(''),

    HTTPHeaders: {
      Authorization: 'Basic ' + btoa(username + ':' + password)
    },

    success: function(soapResponse) {

    },

    error: function(soapResponse) {
      alert('Fehler');
    }
  });

}


function checkUpdateForm() {
  var Fehler = "";
  var Fehler_Message = "";
  var elementId = "";
  var parentId = "";
  var fail = "";

  var v_inputFields = document.querySelector("#form_changeData").querySelectorAll("[id]");
  for (var i = 0, len = v_inputFields.length; i < len; i++) {
    var v_Field = v_inputFields[i];
    if (v_Field.id.indexOf("tel") > -1) {
      var v_checkNo = document.getElementById(v_Field.id).value;
      v_checkNo = v_checkNo.replace(/\s/g, '');
      if (isNaN(v_checkNo) == true) {
        elementId = document.getElementById(v_Field.id);
        parentId = elementId.parentNode.id;
        document.getElementById(parentId).classList.add('has-error');
        Fehler_Message = Fehler_Message + "Ungültige Telefonnummer:" +v_checkNo + "<br />";
        fail = "X";
      } else {
        elementId = document.getElementById(v_Field.id);
        parentId = elementId.parentNode.id;
        document.getElementById(parentId).classList.remove('has-error');

      }
    } else if (v_Field.id.indexOf("mail") > -1) {
if (document.getElementById(v_Field.id).value != "") {
        if (!validEmail(document.getElementById(v_Field.id).value)) {
        elementId = document.getElementById(v_Field.id);
        parentId = elementId.parentNode.id;
        document.getElementById(parentId).classList.add('has-error');
        Fehler_Message = Fehler_Message + "Ungültige E-Mail: " + document.getElementById(v_Field.id).value + "<br />";
        fail = "X";
      } else {
        elementId = document.getElementById(v_Field.id);
        parentId = elementId.parentNode.id;
        document.getElementById(parentId).classList.remove('has-error');

      }



      }
    }
  }

  if (fail != "X") {
    $("#change_Modal_error").html("");
    $("#change_Modal_error").removeClass("alert alert-danger");
    ssBP_Update();
  }
  else {
    $("#change_Modal_error").html(Fehler_Message);
    $("#change_Modal_error").addClass("alert alert-danger");
  }

}

function validEmail(email) {

  var strReg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

  var regex = new RegExp(strReg);

  return (regex.test(email));

}
