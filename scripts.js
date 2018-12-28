const vid = document.querySelector('video');
navigator.mediaDevices.getUserMedia({
    video: true
  }) // request cam
  .then(stream => {
    vid.srcObject = stream; // don't use createObjectURL(MediaStream)
    return vid.play(); // returns a Promise
  })
  .then(() => { // enable the button
    const btn = document.querySelector('button');
    btn.disabled = false;
    btn.onclick = e => {
      takeASnap()
        .then(download);
      document.getElementById('btn').style.display = 'none';
      document.getElementById('file').style.display = 'block';
      document.getElementById('detect').style.display = 'block';
    };
  });



function takeASnap() {
  const canvas = document.createElement('canvas'); // create a canvas
  const ctx = canvas.getContext('2d'); // get its context
  canvas.width = vid.videoWidth; // set its size to the one of the video
  canvas.height = vid.videoHeight;
  ctx.drawImage(vid, 0, 0); // the video
  return new Promise((res, rej) => {
    canvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
  });

}

function download(blob) {
  // uses the <a download> to download a Blob
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'screenshot.jpg';
  document.body.appendChild(a);
  a.click();
}

function display() {
  var file = document.getElementById('file').files[0];

  var reader = new FileReader();
  reader.onload = function (e) {
    var image = document.getElementById("image");
    image.src = e.target.result;
  }

  reader.readAsDataURL(file);
  document.querySelector('video').style.display = 'none';
}

function getParam() {
  var file = document.getElementById('file').files[0];
  var data = new FormData();

  data.append("api_key", "p-A5XPbMUbDA6sOxOmKb2QGRWgr4voHM");
  data.append("api_secret", "CiIvcnNPkhOLihcu5ccx37xFv49VzXxZ");
  data.append("return_attributes", "gender,age,emotion,ethnicity,beauty");
  data.append("image_file", file, "blob");

  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      var obj = JSON.parse(xhr.responseText);
      var faces = obj.faces;

      var tableRes = "";
      for (var i = 0; i < faces.length; i++) {
        var face = faces[i];
        console.log(face);
        var attrs = face.attributes;

        //alert(JSON.stringify(attrs));
        var sex = attrs.gender.value;
        var age = attrs.age.value;
        var ethn = attrs.ethnicity.value;
        var beauty;


        if (sex == "Male")
          beauty = attrs.beauty.male_score;
        else if (sex == "Female")
          beauty = attrs.beauty.female_score;



        if (i == 0)
          tableRes += getLine("Face#", "Gender", "Age", "Ethnicity", "Beauty");


        tableRes += getLine(i + 1, sex, age, ethn, beauty);
      }

      var table = document.getElementById("tableRes");
      table.innerHTML = tableRes;

      styleChange(ethn);
      document.querySelector('hr').style.display = 'block';
      document.getElementById('file').style.display = 'none';
      document.getElementById('detect').style.display = 'none';
    }
  }

  var url = "https://api-us.faceplusplus.com/facepp/v3/detect";
  xhr.open("POST", url, true);

  //Send the proper header information along with the request
  //xhr.setRequestHeader('Content-Type','multipart/form-data; boundary=' + boundary);

  xhr.send(data);
}

function getLine(index, sex, age, ethn, beauty) {
  return "<tr><th>" + index + "</th><th>" + sex + "</th><th>" + age + "</th><th>" + ethn + "</th><th>" + beauty + "</th></tr>";
}

function styleChange(ethn) {
  if (ethn == 'BLACK') {
    document.getElementById('title').style.textAlign = 'center';
    document.getElementById('title').innerHTML =
      'LATEST HOMICIDE VICTIM HAD A HISTORY OF NARCOTICS ABUSE, TANGLES WITH THE LAW';
    document.getElementById('results_stats').innerHTML =
      "You’re 49% as likely to be a suspect of a misdemeanor crime, 62% a suspect of a murder and 40% as likely to be a suspect for a sex crime, because you’re BLACK.";
  } else if (ethn == 'ASIAN') {
    document.getElementById('title').innerHTML =
      'SUSPECTED OF MULTIPLE CRIMES – BRILLIANT, BUT SOCIAL MISFIT';
    document.getElementById('results_stats').innerHTML =
      "You’re 4% as likely to be a suspect of a misdemeanor crime, 4% a suspect of a murder and 8% as likely to be a suspect for a sex crime, because you’re ASIAN.";
  } else if (ethn == 'WHITE') {
    document.getElementById('title').innerHTML =
      'SUSPECT WAS SOFT SPOKEN, POLITE, A GENTLEMAN, EX PRINCIPAL SAYS';
    document.getElementById('results_stats').innerHTML =
      "You’re 22% as likely to be a victim of a misdemeanor crime, 10% a victim of a murder and 24% as likely to be a victim for a sex crime, because you’re WHITE.";
  }
}