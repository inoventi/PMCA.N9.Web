$(function () {
    const dataChart = pid.OrganizerData(dataReport);
    pid.GenerateChart(dataChart);
});
let pid = {
    OrganizerData: function (data) {
        let dataClean = {
            date: [],
            ac: [],
            pc: [],
            av: [],
            prc: [],
            pv: [],
            cp: [],
            ap: []
        };
        let date = [];
        let ac = [];
        let pc = [];
        let av = [];
        let pv = [];
        let prc = [];
        let cp = [];
        let ap = [];
        data.forEach(function (value, index, array) {
            const month = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio','Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
            date.push(month[value.month-1] +" "+ value.anio);
            //Fill AC
            if (value.ac != '') {
                ac.push(Math.round(value.ac * 100) / 100)
            } 
            //Fill PC
            if (value.pc == '') { 
                pc.push(null); 
            } else {
                pc.push(Math.round(value.pc * 100) / 100);

            }
            //Fill AV
            if (value.av != '') {
                av.push(Math.round(value.av * 100) / 100)
            }
            //Fill PRC
            if (value.prc == '') {
                prc.push(null)
            } else {
                prc.push(Math.round(value.prc * 100) / 100);
            }
            //Fill PV
            if (value.pv != '') {
                pv.push(Math.round(value.pv * 100) / 100)
            } else {
                pv.push(null)
            }
            //Fill CP
            if (value.cp != '') {
                cp.push(Math.round(value.cp * 100) / 100)
            } else {
                cp.push(null)
            }

            //Fill AP
            if (value.ap != '') {
                ap.push(Math.round(value.ap * 100) / 100)
            } else {
                ap.push(null)
            }
        }); // end foreach 
        let aclength = (ac.length) - 1;  
        let avlength = (av.length) - 1;  
        prc[avlength] = av[avlength];
        pc[aclength] = ac[aclength];

        // assing data in objet
        dataClean.date.push(date);
        dataClean.ac.push(ac);
        dataClean.pc.push(pc);
        dataClean.av.push(av);
        dataClean.prc.push(prc);
        dataClean.pv.push(pv);
        dataClean.cp.push(cp);
        dataClean.ap.push(ap);

        return dataClean;
    },
    GenerateChart: function (data) {
        Highcharts.chart('inversion', {
            chart: {
                type: 'line',
                zoomType: 'x'
            },
            title: {
                text: ProjectName
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: data.date[0]
            },
            yAxis: {
                title: {
                    text: ''
                },
                min: 0,

            },
            tooltip: {
                formatter: function () {
                    return this.y.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:,.2f}',
                        allowOverlap: true
                    }
                }
            },
            series: [{
                name: 'AC(Costo Real)',
                color: '#800000',
                lineWidth: 1,
                marker: {
                    fillColor: 'red',
                    radius: 5
                },
                data: data.ac[0]
            }, {
                name: 'PC(Costo Proyectado)',
                color: '#800000',
                lineWidth: 1,
                marker: {
                    fillColor: 'red',
                    radius: 5
                },
                dashStyle: 'dash',
                data: data.pc[0]
            }, {
                name: 'AV(Valor Real)',
                color: '#800000',
                lineWidth: 1,
                marker: {
                    fillColor: 'gray',
                    radius: 5
                },
                data: data.av[0]
            }, {
                name: 'PRC(Valor Proyectado)',
                color: '#235b4e',
                lineWidth: 1,
                marker: {
                    fillColor: '#B38E5D',
                    radius: 5
                },
                dashStyle: 'dash',
                data: data.prc[0]
            }, {
                name: 'PV(Valor planeado)',
                color: '#800000',
                lineWidth: 1,
                marker: {
                    fillColor: '#92d050',
                    radius: 5
                },
                data: data.pv[0]
                }, {
                    name: 'CP(Costo Programado)',
                color: '#5B2C6F',
                    lineWidth: 1,
                    marker: {
                        fillColor: '#92d050',
                        radius: 5
                    },
                    data: data.cp[0]
                }, {
                    name: 'AP(Avance Programado)',
                color: '#21618C',
                    lineWidth: 1,
                    marker: {
                        fillColor: '#92d050',
                        radius: 5
                    },
                    data: data.ap[0]
                }],
            navigation: {
                buttonOptions: {
                    enabled: false
                }
            }
        });


    }
}