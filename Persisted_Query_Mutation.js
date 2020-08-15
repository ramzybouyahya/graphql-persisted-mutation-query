module.exports = {
  "query{me{_id,name,email}}": 1,
  "mutation LoginUser($email: String!, $password: String!) {Login(email: $email, password: $password){UserID,token}}": 2,
  "mutation RegisterMutation($name: String!, $email:String!,$password:String!) {Register(name: $name,email:$email,password: $password) {UserID,token}}": 3,
};
