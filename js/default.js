var username = 'IPA_APPL';
var password = 'ipa4nicole';
var json_search = '';


function search()
{

  var ex_gp = document.getElementById('input_GP').value;
  var ex_Name1 = document.getElementById('input_Name1').value;
  var ex_Name2 = document.getElementById('input_Name2').value;
  var ex_GPType = document.getElementById('inputGP_Type').value;
  var ex_Street = document.getElementById('input_Street').value;
  var ex_HouseNo = document.getElementById('input_HouseNo').value;
  var ex_PLZ = document.getElementById('input_PLZ').value;
  var ex_city = document.getElementById('input_city').value;
$.soap(
  {
    url: 'http://sappot101.wwz.local:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=WEB_T&receiverParty=&receiverService=&interface=ssBP_Search&interfaceNamespace=http://wwz.ch/S/99980/BP_Search',
    method:'bp:BP_SearchRequest',
    noPrefix: true,
		appendMethodToURL: false,
    namespaceQualifier: 'bp',
    namespaceURL: 'http://wwz.ch/S/99980/BP_Search',

    data:
    {
      GP_No: ex_gp,
      Name_1: ex_Name1,
      Name_2: ex_Name2,
      GP_Type: ex_GPType,
      Street: ex_Street,
      House_no: ex_HouseNo,
      PLZ: ex_PLZ,
      City: ex_city
    },

    HTTPHeaders:
    {
      Authorization: 'Basic ' + btoa(username + ':' + password)
    },

    envAttributes:
    {
      'xmlns:bp': 'http://wwz.ch/S/99980/BP_Search'
    },

    ssuccess: function (soapResponse)
    {
      json_search = soapResponse.toJSON();
       $("tbody").empty();

       var obj_length = Object.keys(json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List).length;


      Object.keys(json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details).forEach(function(key)
      {
if (json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details[key].hasChildNodes())
{
  aler(Kind);
}
        var IM_GPNo = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details.GP_No['#text'];
        var IM_Name1 = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details.Name_1['#text'];
        var IM_Name2 = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details.Name_2['#text'];
        var IM_GPType = json_search['#document']['SOAP:Envelope']['SOAP:Body']['n0:BP_SearchResponse'].Persons_List.Person_Details.GP_Type['#text'];

        $("tbody").append('<tr id = '+key+' onclick="set_selected_GP(this.id);"> <td>'+IM_GPNo+'</td> <td>'+IM_Name1+'</td> <td>'+IM_Name2+'</td></tr>');
      }),
        $('#selection_modal').modal('show');
    },
  }
);

}


function getDetails() {

}


function checkSearchForm() {
var Fehler = "";
var Fehler_Message = "";

if (document.forms.SearchForm.input_GP.value.length>0 && document.forms.SearchForm.input_GP.value.length<7)
{
Fehler = "X";
Fehler_Message = "<li>Die länge der Geschäftspartnernummer ist zu kurz. Die Nummer muss 7-Zeichen lang sein.</li>";
document.getElementById('div_i_gp').classList.add('has-error');


}

if (document.forms.SearchForm.input_GP.value == "" && document.forms.SearchForm.input_Name2.value == "" &&
document.forms.SearchForm.input_Name1.value == "" && document.forms.SearchForm.input_Street.value == "" &&
document.forms.SearchForm.input_HouseNo.value == "" && document.forms.SearchForm.input_city.value == "" &&
document.forms.SearchForm.input_PLZ.value == "")
{
Fehler = "X";
Fehler_Message = Fehler_Message + "<li>Mindestens ein Feld muss ausgefüllt werden.</li>"
document.getElementById('From_search').classList.add('has-error');

}
if (Fehler == "X")
{
Fehler_Message = "<ul style='list-style-type:disc'>" +Fehler_Message+ "</ul>";
var error_message = document.createElement("DIV");
error_message.classList.add('alert');
error_message.classList.add('alert-danger');
var error_message_text = document.createTextNode(Fehler_Message);
error_message.appendChild(error_message_text);
document.test.appendChild(error_message);

}
else
{

}
}
