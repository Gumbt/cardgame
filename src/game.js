const Deck = require('./deck');

class Game {
    constructor(players, playersId) {
        const deck1 = new Deck();
        this.game = {
            active: true,
            redTeam: {
                points: 0,
                player1: {
                    nome: players[0],
                    id: playersId[0],
                    cartas: [deck1.deal(),
                    deck1.deal(),
                    deck1.deal()]
                },
                player2: {
                    nome: players[1],
                    id: playersId[1],
                    cartas: [deck1.deal(),
                    deck1.deal(),
                    deck1.deal()]
                }
            },
            blueTeam: {
                points: 0,
                player1: {
                    nome: players[2],
                    id: playersId[2],
                    cartas: [deck1.deal(),
                    deck1.deal(),
                    deck1.deal()]
                },
                player2: {
                    nome: players[3],
                    id: playersId[3],
                    cartas: [deck1.deal(),
                    deck1.deal(),
                    deck1.deal()]
                }
            },
            table: {
                coringa: deck1.deal(),
                turno: {
                    player: 'dsadas432' // mudar se pah
                },
                valueTruco: 3,
                requestTruco: {
                    requested: true,
                    by: 'redTeam',
                    value: 6
                },
                centroMesa: []
            }
        }
    }
};
module.exports = Game;