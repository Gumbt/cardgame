var game = {
    redTeam: {
        points: 0,
        player1: {
            nome: "Gumb",
            id: 'dsadas432',
            cartas: [{
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            },
            {
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            },
            {
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            }]
        },
        player2: {
            nome: "Gumb",
            id: 'dsadas432',
            cartas: [{
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            },
            {
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            },
            {
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            }]
        }
    },
    blueTeam: {
        points: 0,
        player1: {
            nome: "Gumb",
            id: 'dsadas432',
            cartas: [{
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            },
            {
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            },
            {
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            }]
        },
        player2: {
            nome: "Gumb",
            id: 'dsadas432',
            cartas: [{
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            },
            {
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            },
            {
                color: 'red',
                type: 'paus',
                img: 'c5',
                value: 5
            }]
        }
    },
    table: {
        coringa: {
            color: 'red',
            type: 'paus',
            img: 'c5',
            value: 5
        },
        turno: {
            player: 4 // mudar se pah
        },
        valueTruco: 3,
        requestTruco: {
            requested: true,
            by: 'redTeam',
            value: 6
        },
        centroMesa: [{// 2 cartas na mesa
            from: 4,
            color: 'red',
            type: 'paus',
            img: 'c5',
            value: 5
        }, {
            from: 2,
            color: 'red',
            type: 'paus',
            img: 'c5',
            value: 5
        }]
    }

};