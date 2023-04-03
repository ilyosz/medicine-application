const express = require('express');
const app = express();
const fs = require('fs');
app.set('view engine', 'pug');
app.use(express.urlencoded({extended: true}));
app.use('/static', express.static('public'));

app.get('/', (req, res) => {
  fs.readFile('./data/medicine.json', (err, data) => {
    if (err) throw err
      const medicines = JSON.parse(data).filter(medicine => medicine.top === true && medicine.delete === false)
    res.render('index',{medicines:medicines});
  })
})
app.get('/medicine', (req, res) => {
  fs.readFile('./data/medicine.json', (err, data) => {
    if (err) throw err
    const archive = req.query.showArchived==="true";
    // console.log("req",req)
    // console.log("res",res)
    const medicines = JSON.parse(data).filter(medicine => medicine.delete === archive).sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
    res.render('medicines', {medicines: medicines,archive:archive});
  })
})
app.get('/medicine/:id', (req, res) => {
  const id = req.params.id
  fs.readFile('./data/medicine.json', (err, data) => {
    if (err) throw err
    const medicines = JSON.parse(data)
    const medicine = medicines.filter(medicine => medicine.id == id)[0]
    res.render('detail',{medicine:medicine});
  })
})
app.post('/medicine/delete/:id', (req, res) => {
  const id = req.params.id
    fs.readFile('./data/medicine.json', (err, data) => {
      if (err) throw err
        const medicines = JSON.parse(data)
        const medicine = medicines.filter(medicine => medicine.id != id)
        fs.writeFile('./data/medicine.json', JSON.stringify(medicine), (err) => {
        if (err) throw err
        res.redirect('/medicine?showArchived=false')
        // res.render('medicines', { medicines: medicine,archive:false })
        })
    })
})
app.get('/create', (req, res) => {
  res.render('create',{medicine:null,error:false});
})
app.get('/edit/:id', (req, res) => {
  const id = req.params.id
  fs.readFile('./data/medicine.json', (err, data) => {
    if (err) throw err
    const medicines = JSON.parse(data)
    const medicine = medicines.filter(medicine => medicine.id == id)[0]
    res.render('create',{medicine:medicine,error:false});
  })
})
app.post('/create', (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const count = req.body.count
  const top = req.body.top === 'on'
  const archive = req.body.archive === 'on'
  if(name.trim().length==0){
    res.render('create',{medicine:null,error:true,errorMessage:'Name is required, please fill the name'});
    return;
  }
  if(description.trim().length==0){
    res.render('create',{medicine:null,error:true,errorMessage:'Description is required, please fill the description'});
  }else{
    fs.readFile('./data/medicine.json', (err, data) => {
      if (err) throw err
      const medicines = JSON.parse(data)
      medicines.push({
        id:id(),
        name: name,
        description: description,
        count:parseInt(count),
        top:top,
        delete:archive,
        createdAt:new Date().toString()
      })
      fs.writeFile('./data/medicine.json', JSON.stringify(medicines), (err) => {
        if (err) throw err
        res.redirect('/medicine?showArchived=false')
      })
    })
  }

})
app.post('/edit/:id', (req, res) => {
  const name = req.body.name
  const description = req.body.description
  const count = req.body.count
  const top = req.body.top === 'on'
  const archive = req.body.archive === 'on'
  const pathId = req.params.id
  fs.readFile('./data/medicine.json', (err, data) => {
    if (err) throw  err
    const medicines = JSON.parse(data)
    const medicine = medicines.filter(medicine => medicine.id == pathId)[0]
    if(medicine!==undefined && medicine!==null) {
      medicine.name = name
      medicine.description = description
      medicine.count = parseInt(count)
      medicine.top = top
      medicine.delete = archive
      medicine.createdAt = new Date().toString()
      if(name.trim().length==0){
        res.render('create',{medicine:null,error:true,errorMessage:'Name is required, please fill the name'});
        return;
      }
      if(description.trim().length==0){
        res.render('create',{medicine:null,error:true,errorMessage:'Description is required, please fill the description'});
      }else{
        medicines.forEach((item,index)=>{
          if(item.id===medicine.id){
            medicines[index]=medicine;
          }
        })
        fs.writeFile('./data/medicine.json', JSON.stringify(medicines), (err) => {
          if (err) throw err
          res.redirect('/medicine/'+medicine.id)
        })
      }


    }else{
        res.render('create',{medicine:null,error:true,errorMessage:'Medicine not found'});
    }
  })
})


app.get('/api/v1/medicine', (req, res) => {
  fs.readFile('./data/medicine.json', (err, data) => {
    if (err) throw err
    const archive = req.query.showArchived==="true";
    const medicines = JSON.parse(data).filter(medicine => medicine.delete === archive).sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
    res.json(medicines);
  })
})
app.get('/api/v1/medicine/:id', (req, res) => {
  const pathId = req.params.id
  fs.readFile('./data/medicine.json', (err, data) => {
    if (err) throw err
    const medicines = JSON.parse(data)
    const medicine = medicines.filter(medicine => medicine.id == pathId)[0]
    console.log(medicine)
    res.json(medicine);
  })
})

app.listen(8000,err=>{
  if(err) console.log(err);
  console.log('Server is running on port 8000');
})

function id () {
  return '_' + Math.random().toString(36).substr(2, 9);
}