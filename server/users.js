const users = []

function userJoin(id,username,room){
    const user = {id,username,room};
    users.push(user);
    console.log(`${username} has joined ${room}`)
    return user;
}

function getUser(id){
    return users.find(user => user.id === id);
}

//user leaves the room
function userLeave(id){
    const index = users.findIndex(user => user.id === id);
    if(index!== -1){
        return users.splice(index,1)[0];
    }
}

//get room users

function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getUser,
    userLeave,
    getRoomUsers
}