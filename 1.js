const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

const doExcFn = (fns,values,resolve,reject) =>{
  try{
    const result = fns(values)
    resolve(result)
  }catch(e){
    reject(e)
  }
}

class MyPromise {
    state = PENDING;
    value = void 0;
    reason = void 0;
    onFulfilledFns = [];
    onRejectedFns = [];
  constructor(executor){
    executor(this.resolve,this.reject);
  }

  resolve = (value)=>{
    queueMicrotask(()=>{
      if(this.state === PENDING){
        this.state = FULFILLED;
        this.value = value;
        this.onFulfilledFns.forEach(fn => fn(value));
      }
    })
  }
  reject = (reason)=>{
    queueMicrotask(()=>{
      if(this.state === PENDING){
        this.state = REJECTED
        this.reason = reason;
        this.onRejectedFns.forEach(fn => fn(reason));
        }
    })
  }

  then = (onFulfilled, onRejected) => {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
    return new MyPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        doExcFn(onFulfilled, this.value, resolve, reject)
      }
      if (this.state === REJECTED) {
        doExcFn(onRejected, this.reason, resolve, reject)
      }
      if (this.state === PENDING) {
        this.onFulfilledFns.push((v) => {
          doExcFn(onFulfilled, v, resolve, reject)
        })
        this.onRejectedFns.push((v) => {
          doExcFn(onRejected, v, resolve, reject)
        })
      }
    }
    )

  }
  static resolve(value) {
    if(value instanceof MyPromise) return value
    return new MyPromise(value => value(value))
}
}


const lights = (light,duration)=>{
  return new MyPromise((resolve,reject)=>{
      setTimeout(()=>{
          console.log(light,'灯');
          resolve(light)
      },duration)
  })
}

const turnOff = async()=>{
  MyPromise.resolve()
  .then(()=>lights('红',3000))
  .then(()=>lights('黄',1000))
  .then(()=>lights('绿',2000))
  .then(()=>turnOff())
}

turnOff()