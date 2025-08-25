
export const parseQuery =() =>{
    const params = new URLSearchParams(window.location.search)
    return{
        audio1: params.get('audio1'),
        audio2: params.get('audio2'),
        audio3: params.get('audio3'),
        audio4: params.get('audio4'),
        returnUrl:params.get('returnUrl'),
    }
}