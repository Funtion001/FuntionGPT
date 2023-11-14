const lights = (light,duration)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            console.log(light,'灯');
            resolve(light)
        },duration)
    })
}

const turnOff = async()=>{
    Promise.resolve()
    .then(()=>lights('红',3000))
    .then(()=>lights('黄',1000))
    .then(()=>lights('绿',2000))
    .then(()=>turnOff())
}

turnOff()