var config = {
    container: "#OrganiseChart1",
    rootOrientation: 'NORTH', // NORTH || EAST || WEST || SOUTH
    scrollbar: "fancy",
    // levelSeparation: 30,
    siblingSeparation: 20,
    subTeeSeparation: 60,

    connectors: {
        type: 'step'
    },
    node: {
        HTMLclass: 'nodeExample1'
    }
},
    ceo = {
        text: {
            name: "Mark Hill",
            title: "Chief executive officer",
            contact: "Tel: 01 213 123 134",
        },
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "ceo"
    },

    cto = {
        parent: ceo,
        text: {
            name: "Joe Linux",
            title: "Chief Technology Officer",
        },
        //stackChildren: true,
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "cto"
    },
    cbo = {
        parent: ceo,
        //stackChildren: true,
        text: {
            name: "Linda May",
            title: "Chief Business Officer",
        },
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "cbo"
    },
    cdo = {
        parent: ceo,
        text: {
            name: "John Green",
            title: "Chief accounting officer",
            contact: "Tel: 01 213 123 134",
        },
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "cdo"
    },
    cio = {
        parent: cto,
        text: {
            name: "Ron Blomquist",
            title: "Chief Information Security Officer"
        },
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "cio"
    },
    ciso = {
        parent: cto,
        text: {
            name: "Michael Rubin",
            title: "Chief Innovation Officer",
            contact: "we@aregreat.com"
        },
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "ciso"
    },
    cio2 = {
        parent: cdo,
        text: {
            name: "Erica Reel",
            title: "Chief Customer Officer"
        },
        link: {
            href: "www.google.com"
        },
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "cio2"
    },
    ciso2 = {
        parent: cbo,
        text: {
            name: "Alice Lopez",
            title: "Chief Communications Officer"
        },
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "ciso2"
    },
    ciso3 = {
        parent: cbo,
        text: {
            name: "Mary Johnson",
            title: "Chief Brand Officer"
        },
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "ciso2"
    },
    ciso4 = {
        parent: cbo,
        text: {
            name: "Kirk Douglas",
            title: "Chief Business Development Officer"
        },
        image: "https://wp-assets.highcharts.com/www-highcharts-com/blog/wp-content/uploads/2018/11/12132317/Grethe.jpg",
        HTMLid: "ciso2"
    }

ALTERNATIVE = [
    config,
    ceo,
    cto,
    cbo,
    cdo,
    cio,
    ciso,
    cio2,
    ciso2,
    ciso3,
    ciso4
];