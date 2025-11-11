$(function () {
    plibrary.init();
    $('.highcharts-legend-box').parent().remove();; 
});

let plibrary = {
    init: function () {
        var colors = ['#235b4e', '#bfbfbf'];
        
        let categoriesArr = [];
        let DataSict = [];
        let DataPns = [];
        dataChart.forEach(function (item, index) {
            if (item.state == 'Nuevo Le&#xF3;n') {
                categoriesArr.push('Nuevo León');
            }
            else if (item.state == 'Michoac&#xE1;n') {
                categoriesArr.push('Michoacán');
            }
            else if (item.state == 'M&#xE9;xico') {
                categoriesArr.push('México');
            }
            else if (item.state == 'Ciudad de M&#xE9;xico') {
                categoriesArr.push('Ciudad de México');
            }
            else if (item.state == 'Quer&#xE9;taro') {
                categoriesArr.push('Querétaro');
            }
            else if (item.state == 'San Luis Potos&#xED;') {
                categoriesArr.push('San Luis Potosí');
            }
            else if (item.state == 'Yucat&#xE1;n') {
                categoriesArr.push('Yucatán');
            } else {
                categoriesArr.push(item.state);
            }

            DataSict.push(parseInt(item.sict));
            DataPns.push(parseInt(item.pns));
            //console.log(item, index);
        });
        console.log(categoriesArr, DataSict, DataPns);
        Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'PROYECTOS POR ENTIDAD'
            },
            xAxis: {
                categories: categoriesArr,
                labels: {
                    rotation: 90
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Total'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: ( // theme
                            Highcharts.defaultOptions.title.style &&
                            Highcharts.defaultOptions.title.style.color
                        ) || 'gray'
                    }
                }
            },
            legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            tooltip: {
                headerFormat: '<b>{point.x}</b><br/>',
                pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            if (this.y > 0)
                                return this.y;
                        }
                    }
                },
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            colors: colors,
            series: [{
                name: 'Proyectos SICT',
                data: DataSict //[10, 8, 7, 8, 6, 5, 5, 3, 4, 3, 2, 1, 1, 3, 1]
            }, {
                name: 'Propuestas no solicitadas',
                data: DataPns // [9, 8, 8, 7, 5, 5, 3, 5, 4, 4, 3, 3, 3, 1, 1]
            }]
        });
       

    }
} 