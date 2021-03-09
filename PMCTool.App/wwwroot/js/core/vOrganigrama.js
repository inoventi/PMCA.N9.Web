$(function (){
    AJAXCompanies();
    Buscar();
    $('#OrganiseChart1').hide();
});
function Buscar() {
    $('#btnbuscar').click(function () {
        
        let empresa = $('.selectpicker').val();
        if (empresa == "") {
            Swal.fire(
                ' ',
                $.i18n._('Analytics4_002'),
                'warning'
            )
        } else {
            AJAXAreasByCompany(empresa);
            $('#OrganiseChart1').show();
        }
    });
}
function AJAXAreasByCompany(empresa) {
    $.ajax({
        method: "GET",
        url: "/Analytics/GetOrganigramaByCompany?&companyId=" + empresa,
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            LoaderHide();
            $('#organigramas').empty();
            if (data.areas == "") {
                Swal.fire(
                    ' ',
                    $.i18n._('Analytics4_003'),
                    'warning'
                )
            } else {
                var areas = data.areas;
                var arrayResponsables = data.responsable;
                var responsables = [];
                const comments = [];
                const Arrayareas = [];
                var AreaSinEscalamiento = 0;
                //console.log(data);
                for (var i = 0; i < areas.length; i++) {
                    if (areas[i].escalationArea == '00000000-0000-0000-0000-000000000000') {
                        //console.log(areas[i]);
                        if (arrayResponsables == "") {
                            comments.push({
                                id: areas[i].areaID,
                                parent: null,
                                text: {
                                    name: areas[i].tituloArea
                                },
                                HTMLid: areas[i].areaID,
                                HTMLclass: 'nodeExample1'
                            });
                        } else {
                            for (var r = 0; r < arrayResponsables.length; r++) {
                                //console.log(arrayResponsables[r].areaID + '===' + areas[i].areaID);
                                if (arrayResponsables[r].areaID == areas[i].areaID) {
                                    var nombre = arrayResponsables[r].responsable;
                                    nombre = nombre.split(" ", 2);
                                    nombreCorto = nombre[0] + ' ' + nombre[1];
                                    var foto = arrayResponsables[r].owner_photo;
                                    if (foto == "" || foto == null) {
                                        foto = "/images/avatar/default-avatar.png";
                                    }
                                    comments.push({
                                        id: areas[i].areaID,
                                        parent: null,
                                        text: {
                                            name: areas[i].tituloArea,
                                            title: nombreCorto
                                        },
                                        image: foto,
                                        HTMLid: areas[i].areaID,
                                        HTMLclass: 'nodeExample1'
                                    });
                                }
                                if (areas[i].participantId == '00000000-0000-0000-0000-000000000000') {
                                    comments.push({
                                        id: areas[i].areaID,
                                        parent: null,
                                        text: {
                                            name: areas[i].tituloArea
                                        },
                                        HTMLid: areas[i].areaID,
                                        HTMLclass: 'nodeExample1'
                                    });
                                }
                            }
                        }
                        AreaSinEscalamiento++;
                    } else {
                        //ENTRA EN ESTE ELSE CUANDO EL AREA SI TIENE ESCALAMIENTO
                        if (arrayResponsables == "") {
                            comments.push({
                                id: areas[i].areaID,
                                parent: areas[i].escalationArea,
                                text: {
                                    name: areas[i].tituloArea
                                },
                                HTMLid: areas[i].areaID,
                                HTMLclass: 'nodeExample1'
                            });

                        } else {
                            //ENTRA CUANDO SI ENCUENTRA RESPONSABLES
                            //console.log(arrayResponsables);
                            
                            for (var rr = 0; rr < arrayResponsables.length; rr++) {
                                //console.log(areas[i].areaID + '==='+ arrayResponsables[rr].areaID);
                                if (arrayResponsables[rr].areaID == areas[i].areaID) {
                                    var nombre = arrayResponsables[rr].responsable;
                                    nombre = nombre.split(" ", 2);
                                    nombreCorto = nombre[0] + ' ' + nombre[1];
                                    var foto = arrayResponsables[rr].owner_photo;
                                    if (foto == "" || foto == null) {
                                        foto = "/images/avatar/default-avatar.png";
                                    }
                                    //console.log(nombreCorto);
                                    comments.push({
                                        collapsed: false,
                                        id: areas[i].areaID,
                                        parent: areas[i].escalationArea,
                                        text: {
                                            name: areas[i].tituloArea,
                                            title: nombreCorto
                                        },
                                        image: foto,
                                        HTMLid: areas[i].areaID,
                                        HTMLclass: 'nodeExample1'
                                    });
                                    areas[i].areaID = true;
                                }
                                if (areas[i].participantId == "00000000-0000-0000-0000-000000000000") {
                                    comments.push({
                                        collapsed: false,
                                        id: areas[i].areaID,
                                        parent: areas[i].escalationArea,
                                        text: {
                                            name: areas[i].tituloArea
                                        },
                                        HTMLid: areas[i].areaID,
                                        HTMLclass: 'nodeExample1'
                                    });
                                }
                            }
                        }
                    }
                }
                    var participants = data.participants;

                    for (var b = 0; b < arrayResponsables.length; b++) {
                        for (var a = 0; a < participants.length; a++) {
                            if (participants[a].participantId == arrayResponsables[b].participantId) {
                                participants[a].rarea = true;
                            }
                        }
                    }
                    for (var o = 0; o < participants.length; o++) {
                        if (participants[o].rarea == false) {
                            var nombre = participants[o].responsable;
                            nombre = nombre.split(" ", 2);
                            nombreCorto = nombre[0] + ' ' + nombre[1];
                            var foto = participants[o].owner_photo;
                            if (foto == "" || foto == null) {
                                foto = "/images/avatar/default-avatar.png";
                            }
                            comments.push({
                                collapsed: false,
                                id: "P" + o,
                                parent: participants[o].areaID,
                                text: {
                                    title: nombreCorto
                                },
                                image: foto,
                                HTMLid: "P" + o,
                                HTMLclass: 'nodeExample1'
                            });
                        }
                    }
                    for (var aa = 0; aa < comments.length; aa++) {
                        if (aa != 0) {
                            if (comments[aa].id == comments[aa - 1].id) {
                                //No  se agregara el area por que esta duplicado con el anterio
                            } else {
                                //Se agrega el area por que no esta duplicado
                                Arrayareas.push(comments[aa]);
                            }
                        } else {
                            Arrayareas.push(comments[aa]);
                        }
                }
                if (AreaSinEscalamiento == 0) {
                    Swal.fire(
                        ' ',
                        $.i18n._('Analytics4_004'),
                        'warning'
                    )
                    } else {
                        const nest = (items, id = null, link = 'parent') => items.filter(item => item[link] === id).map(item => ({ ...item, children: nest(items, item.id) }));
                        var divOrganigramas = $('#organigramas');
                        var divCharts = 'chart';
                        for (var ci = 0; ci < Arrayareas.length; ci++) {
                            var nameChartsOrganigrama = divCharts + ci;
                            const arbol = nest(Arrayareas)[ci];
                            divOrganigramas.append('<div id="' + nameChartsOrganigrama + '"></div>');
                            var tree = new Treant(organigramacontr(arbol, nameChartsOrganigrama));
                    }
                }
                function organigramacontr(arbol, nameChartsOrganigrama) {
                    simple_chart_config = {
                        chart: {
                            container: "#" + nameChartsOrganigrama,
                            rootOrientation: 'NORTH', // NORTH || EAST || WEST || SOUTH
                            scrollbar: "fancy",
                            //// levelSeparation: 30,
                            //siblingSeparation: 20,
                            //subTeeSeparation: 60,
                            animateOnInit: true,
                            node: {
                                collapsable: true
                            },
                            animation: {
                                nodeAnimation: "easeOutBounce",
                                nodeSpeed: 700,
                                connectorsAnimation: "bounce",
                                connectorsSpeed: 700
                            },
                            connectors: {
                                type: "step"
                            }
                        },
                        nodeStructure: arbol
                    };
                    return simple_chart_config;
                }
            }
        },
        complete: function () {
            LoaderHide();

        },
        error: function (xhr, status, error) {
            LoaderHide();
        }
    });
}
function AJAXCompanies() {
    $.ajax({
        method: "GET",
        url: "/Companies/GetCompanies",
        beforeSend: function () {
            LoaderShow();
        },
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                $('.selectpicker').append('<option value="' + data[i].companyID + '">' + data[i].name + '</option>');
            }
            $('.selectpicker').selectpicker('refresh');
        },
        complete: function () {
            LoaderHide();
        },
        error: function (xhr, status, error) {
            LoaderHide();
        }
    });
}