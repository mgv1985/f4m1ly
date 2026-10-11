const questions=[
  ["Ποια εξωτερικά γεγονότα κλόνισαν τη ρωμαϊκή ειρήνη και απείλησαν τη διάλυση του κράτους;","Οι Γότθοι από τον βορρά και οι Πέρσες από την ανατολή παραβίαζαν τα σύνορα της αυτοκρατορίας, λεηλατούσαν τις ακριτικές επαρχίες και εμπόδιζαν το εμπόριο."],
  ["Ποια εσωτερικά γεγονότα κλόνισαν τη ρωμαϊκή ειρήνη και απείλησαν τη διάλυση του κράτους;","Ο στρατός είχε γίνει παντοδύναμος και συχνά οι στρατιώτες συγκρούονταν μεταξύ τους και ανεβοκατέβαζαν αυτοκράτορες. Επίσης, κάποιες επαρχίες αποσχίστηκαν από την αυτοκρατορία, ενώ οι διωγμοί των Χριστιανών προκαλούσαν δυσαρέσκεια και διχασμό."],
  ["Ποιος ήταν ο αυτοκράτορας και πώς προσπάθησε να αντιμετωπίσει το πρόβλημα;","Ο αυτοκράτορας ήταν ο Διοκλητιανός. Προσπάθησε να αντιμετωπίσει τα προβλήματα εφαρμόζοντας το σύστημα της Τετραρχίας, δηλαδή χωρίζοντας την αυτοκρατορία σε τέσσερις μεγάλες περιφέρειες."],
  ["Τι ήταν το σύστημα της τετραρχίας και τι κατάφερε να πετύχει μ’ αυτό;","Η Τετραρχία ήταν ένα σύστημα διοίκησης στο οποίο η αυτοκρατορία χωρίστηκε σε τέσσερις περιφέρειες, καθεμία με τον δικό της άρχοντα. Με αυτό το σύστημα επανήλθαν η ηρεμία και η τάξη στο κράτος και η ασφάλεια στα σύνορα."],
  ["Ποιοι ήταν οι τέσσερις συνάρχοντες και τι έκαναν μετά την παραίτηση του Διοκλητιανού;","Οι τέσσερις συνάρχοντες που αναφέρει το βιβλίο ήταν ο Κωνσταντίνος και ο Μαξέντιος στη Δύση και ο Λικίνιος και ο Γαλέριος στην Ανατολή. Μετά την παραίτηση του Διοκλητιανού συγκρούστηκαν για την εξουσία. Τελικά, νικητές αναδείχθηκαν ο Κωνσταντίνος και ο Λικίνιος."],
  ["Τι έκαναν για να δώσουν τέλος στην αναστάτωση που είχαν προκαλέσει οι διωγμοί των Χριστιανών;","Ο Κωνσταντίνος και ο Λικίνιος υπέγραψαν το Διάταγμα της Ανεξιθρησκίας στο Μεδιόλανο της Ιταλίας, το 313 μ.Χ., για να σταματήσουν τις θρησκευτικές συγκρούσεις."],
  ["Τι προέβλεπε το διάταγμα αυτό;","Το Διάταγμα των Μεδιολάνων προέβλεπε ότι κάθε πολίτης της αυτοκρατορίας μπορούσε να λατρεύει ελεύθερα όποιον θεό ήθελε, χωρίς να διώκεται για την πίστη του. Έτσι άνοιξε ο δρόμος για την εξάπλωση του Χριστιανισμού."],
  ["Πότε και πού συγκρούστηκαν ο Κωνσταντίνος με τον Λικίνιο και ποιο ήταν το αποτέλεσμα;","Ο Κωνσταντίνος και ο Λικίνιος συγκρούστηκαν το 324 μ.Χ. στην Αδριανούπολη. Νικητής ήταν ο Κωνσταντίνος, ο οποίος έγινε μονοκράτορας ολόκληρης της Ρωμαϊκής Αυτοκρατορίας."],
  ["Σε ποιες αλλαγές προχώρησε ο Κωνσταντίνος για την καλύτερη διοίκηση της αυτοκρατορίας;","Αναδιοργάνωσε τον στρατό, διόρισε έπαρχους με πολλές εξουσίες, οργάνωσε διπλωματικές επαφές, έκοψε νέο χρυσό νόμισμα και μετέφερε την πρωτεύουσα από τη Ρώμη στο Βυζάντιο."]
];
const list=document.querySelector('#questionList');
list.innerHTML=questions.map(([question,answer],index)=>`<details><summary><span>${String(index+1).padStart(2,'0')}</span>${question}</summary><div><b>ΑΠΑΝΤΗΣΗ</b><p>${answer}</p></div></details>`).join('');
const menu=document.querySelector('#menuButton'),nav=document.querySelector('#lessonNav');
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
const sections=[...document.querySelectorAll('main [id]')],links=[...nav.querySelectorAll('a')];
const observer=new IntersectionObserver(entries=>{const current=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!current)return;links.forEach(link=>link.classList.toggle('active',link.hash===`#${current.target.id}`))},{rootMargin:'-20% 0px -65%',threshold:[0,.25,.6]});
sections.forEach(section=>observer.observe(section));

const lightbox=document.querySelector('#imageLightbox');
const lightboxImage=document.querySelector('#lightboxImage');
const lightboxCaption=document.querySelector('#lightboxCaption');
const historyImages=[...document.querySelectorAll('main img')];
let lightboxIndex=0;
const closeLightbox=()=>lightbox.close();
const showHistoryImage=index=>{
  lightboxIndex=(index+historyImages.length)%historyImages.length;
  const image=historyImages[lightboxIndex];
  lightboxImage.src=image.currentSrc||image.src;
  lightboxImage.alt=image.alt;
  lightboxCaption.textContent=image.closest('figure')?.querySelector('figcaption')?.textContent||image.alt;
  if(!lightbox.open)lightbox.showModal();
  document.body.classList.add('lightbox-open');
};
const changeHistoryImage=direction=>showHistoryImage(lightboxIndex+direction);
historyImages.forEach((image,index)=>{
  image.tabIndex=0;
  image.setAttribute('role','button');
  image.setAttribute('aria-label',`${image.alt}. Μεγέθυνση εικόνας`);
  const openImage=()=>showHistoryImage(index);
  image.addEventListener('click',openImage);
  image.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openImage()}});
});
lightbox.querySelector('.lightbox-close').addEventListener('click',closeLightbox);
document.querySelector('#previousHistoryImage').addEventListener('click',()=>changeHistoryImage(-1));
document.querySelector('#nextHistoryImage').addEventListener('click',()=>changeHistoryImage(1));
lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox()});
document.addEventListener('keydown',event=>{
  if(!lightbox.open)return;
  if(event.key==='ArrowLeft')changeHistoryImage(-1);
  if(event.key==='ArrowRight')changeHistoryImage(1);
});
lightbox.addEventListener('close',()=>{
  document.body.classList.remove('lightbox-open');
  lightboxImage.removeAttribute('src');
});
