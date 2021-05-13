import * as GameApi from './GameApi'

const randStr = (size) => {
    var result = ''
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < size; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return result
}

const normalImageData = () => {
    return randStr(2000)
}

const bigImageData = () => {
    return randStr(1 * 1024 * 1024)
}

export const RunIntegrationTest = async () => {
    const rnd = parseInt((Date.now() / 1000) + 3600, 10)
    const gameName = "test_game_" + rnd
    console.log ('creating users')
    const user1 = await GameApi.Login("test_user1_" + rnd)
    const user2 = await GameApi.Login("test_user2_" + rnd)

    console.log ('creating game')
    await GameApi.CreateGame(gameName, user1)

    console.log ('joining game')
    var game = await GameApi.JoinGame(gameName, user1)
    game = await GameApi.JoinGame(gameName, user2)

    console.log ('starting game')
    game = await GameApi.StartGame(game.id, { rounds: 2}, user1)

    console.log ('uploading descriptions')
    game = await GameApi.UploadDescription("user 1 description", game.id, user1.name, user1)
    game = await GameApi.UploadDescription("user 2 description", game.id, user2.name, user2)
    
    console.log ('uploading normal image')
    game = await GameApi.UploadDrawing(normalImageData(), game.id, user1.name, "", user2)
    
    console.log ('uploading large image')
    game = await GameApi.UploadDrawing(bigImageData(), game.id, user2.name, "", user1)

    console.log(game)


}