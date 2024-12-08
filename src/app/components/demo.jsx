async function getdata(){
    const res = axios.get('lkkdjkldsfjkl');
    return res.data;
}
export default async function(){
    const userData = getdata();
    return (
        <div>
            {userData.email}
            {userData.name}
        </div>
    )
}