const API = 'http://localhost:8082'

const get = async (path:string) => {
    const res = await fetch(`${API}${path}`)
    if(!res.ok) throw new Error(`Failed: ${res.status}`)
    return res.json();
}

const post = async (path:string,body:any) => {
    const res = await fetch(`${API}${path}`,{
        method:'POST',
        headers:{ 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if(!res.ok) throw new Error(`Failed : ${res.status}`)
    return res.json();
}

export {get,post};