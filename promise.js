const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function execFunctionWithCatchError(execFn, value, resolve, reject) {
    try {
        const result = execFn(value);
        if (result instanceof MyPromise) {
            result.then(resolve, reject);
        } else {
            resolve(result);
        }
    } catch (e) {
        reject(e);
    }
}

function isFunction(fn) {
    return typeof fn === 'function'
}

class MyPromise {
    state = PENDING;
    value = undefined;
    reason = undefined;
    onFulfilledFns = [];
    onRejectedFns = [];
    constructor(executor) {
        // 立即执行
        try {
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch (e) {
            this.reject.call(this, e)
        }
    }
    resolve(value) {
        if (this.state === PENDING) {
            queueMicrotask(() => {
                if (this.state !== PENDING) return
                this.state = FULFILLED;
                this.value = value;
                this.onFulfilledFns.forEach(fn => fn(this.value))
            })
        }
    }
    reject(reason) {
        if (this.state === PENDING) {
            queueMicrotask(() => {
                if (this.state !== PENDING) return
                this.state = REJECTED;
                this.reason = reason;
                this.onRejectedFns.forEach(fn => fn(this.reason))
            }
            )
        }
    }
    then(onFulfilled, onRejected) {
        onFulfilled = isFunction(onFulfilled) ? onFulfilled : v => v;
        onRejected = isFunction(onRejected) ? onRejected : r => { throw r };

        return new MyPromise((resolve, reject) => {
            if (this.state === FULFILLED && onFulfilled) {
                execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
            }
            if (this.state === REJECTED && onRejected) {
                execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
            }
            if (this.state === PENDING) {
                this.onFulfilledFns.push(v => {
                    execFunctionWithCatchError(onFulfilled, v, resolve, reject)
                })
                this.onRejectedFns.push(v => {
                    execFunctionWithCatchError(onRejected, v, resolve, reject)
                })
            }
        })
    }
    catch(onRejected) {
        return this.then(undefined, onRejected)
    }
    finally(onFinally) {
        return this.then(onFinally, onFinally)
    }
    static resolve(value) {
        if (value instanceof MyPromise) return value
        return new MyPromise(resolve => resolve(value))
    }
    static reject(reason) {
        if (reason instanceof MyPromise) return reason
        return new MyPromise((resolve, reject) => reject(reason))
    }
    static all(promises) {
        return new MyPromise((resolve, reject) => {
            if (typeof promises[Symbol.iterator] !== 'function') {
                reject('err')
            }
            if (promises.length === 0) {
                resolve([])
            }
            const values = []
            promises.forEach(promise => {
                MyPromise.resolve(promise).then(res => {
                    values.push(res)
                    if (values.length === promises.length) {
                        resolve(values)
                    }
                }, rej => {
                    reject(rej)
                })
            })
        })
    }
    static allSettled(promises) {
        return new MyPromise((resolve, reject) => {
            if (typeof promises[Symbol.iterator] !== 'function') {
                reject('err')
            }
            if (promises.length === 0) {
                resolve([])
            }
            const values = []
            promises.forEach(promise => {
                MyPromise.resolve(promise).then(res => {
                    values.push({ status: FULFILLED, value: res })
                    if (values.length === promises.length) {
                        resolve(values)
                    }
                }, err => {
                    values.push({ status: REJECTED, value: err })
                    if (values.length === promises.length) {
                        resolve(values)
                    }
                })
            })
        })
    }
    static race(promises) {
        return new MyPromise((resolve, reject) => {
            if (typeof promises[Symbol.iterator] !== 'function') {
                reject('err')
            }
            promises.forEach((promise) => {
                promise.then(resolve, reject)
            })
        })
    }
    static any(promises) {
        const reasons = []
        return new MyPromise((resolve, reject) => {
            if (typeof promises[Symbol.iterator] !== 'function') {
                reject('err')
            }
            promises.forEach((promise) => {
                promise.then(resolve, err => {
                    reasons.push(err)
                    if (reasons.length === promises.length) {
                        reject(reasons)
                    }
                })
            })
        })
    }
}


const lights = (light, duration) => {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            console.log(light, '灯');
            resolve(light)
        }, duration)
    })
}

const turnOff = async () => {
    MyPromise.resolve()
        .then(() => lights('红', 3000))
        .then(() => lights('黄', 1000))
        .then(() => lights('绿', 2000))
        .finally(() => lights('灭', 1000))
        .then(() => console.log('end'))
        .then(() => console.log('end'))

}

turnOff()


