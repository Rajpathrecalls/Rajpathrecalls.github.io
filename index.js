var onbodyloadcompletly=false;

async function init()
{
    iniuser.init();
    comments.init();
    content.init();
    noti.init();
    mobile.init();
    isandroid.check();
    menu.init();
    USER.init();
    await FireBase.init();
    onbodyloadcompletly=true;
}

var lastWidth = window.outerWidth;
function resize()
{
    if(window.outerWidth!=lastWidth)
        location.reload();
}
//Firebase Config
var firebaseConfig = {
    apiKey: "AIzaSyABNQF9ZiZTzmzYYZp9y0U1zmHmxThOseE",
    authDomain: "rajpathrecalls-15944.firebaseapp.com",
    databaseURL: "https://rajpathrecalls-15944.firebaseio.com",
    projectId: "rajpathrecalls-15944",
    storageBucket: "rajpathrecalls-15944.appspot.com",
    messagingSenderId: "912134912883",
    appId: "1:912134912883:web:d98ff319fabadb46a3a306",
    measurementId: "G-0LS86C0FPG"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

var res=[];
firebase.database().ref('Chat/').on('value',(sanapshot)=>{
    res=null;
    res=[];
    sanapshot.forEach((childsnap) => {
    res.push(childsnap.val());
    });
    comments.set_cmt_sh();
    if(comments.opened=="comment")
        comments.add_comments();
    else{
        var plays=document.getElementsByClassName("play");
        plays[2].children[0].children[0].style.opacity=1;
    }
});
firebase.database().ref("CurEvent").on('value',(val)=>{
    var _val="Music Cloud - 1000+Songs"
    if(val.val()!="unset")
        _val=val.val();
    document.getElementById("cur_event").innerHTML=_val;
});
var sch=[];
firebase.database().ref('Schedule/').on('value',(sanapshot)=>{
    sch=[];
    sanapshot.forEach((childsnap) => {
    sch.push(childsnap.val());
    });
    sch.sort((a,b)=>{return a.time<b.time?-1:1});
    if(comments.opened=="schedule")
        comments.add_schedule();
    else{        
        var plays=document.getElementsByClassName("play");
        plays[1].children[0].children[0].style.opacity=1;
    }
    comments.add_schedule(true);
});
var OnlineUsers;
firebase.database().ref('ActiveUsers/').on('value',(sanapshot)=>{
    OnlineUsers=0;
    sanapshot.forEach((childsnap) => {
    OnlineUsers++;
    });
    console.log("Users Online : "+OnlineUsers);
});
var ref=firebase.database().ref('ActiveUsers/').push({
    platform:"web-github.io"
});
//console.log(ref.key);
ref.onDisconnect().remove();

var USER={
    init()
    {
        this.is_user_exsist=false;
        this.getuser();
        if(this.is_user_exsist)
        {
            this.remove_login();
            console.log("y");
        }
    },
    getuser()
    {
        var user = firebase.auth().currentUser;
        //Change Code Latervar user = firebase.auth().currentUser;
        if (user) {
            // User is signed in.
            this.is_user_exsist=true;
        } 
        else{
            // No user is signed in.
            this.is_user_exsist=false;
        }
        return user;
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        USER.getuser();
        USER.is_user_exsist=true;
    } else {
        //No User
    }
});
var FireBase={
    async init()
    {
        //Delay test
        await this.timer(10);
    },
    async timer(ms)
    {
        return new Promise(res=>setTimeout(res,ms));
    },
    add_new(msg)
    {
        var ar=[];
        ar["sender"]=comments.name;
        if(USER.is_user_exsist){
            ar["sender"]=comments.name+" ✅";
        }
        ar["message"]=msg;
        var curdate=new Date;
        ar["time"]=curdate.getTime();
        firebase.database().ref('Chat/').push(ar);
    }
}

//Comments and headphone divs mgmt
var comments={
    init()
    {
        this.cmts=document.getElementById("cmts");
        this.cmtbox=document.getElementsByClassName("comment")[0];
        this.layer=document.getElementsByClassName("layer")[0];
        this.input=document.getElementById("msg");
        this.btn=document.getElementById("bt");
        this.goingtosend=false;
        this.settingname=false;
        this.name=iniuser.get();
        this.namediv=document.getElementById("name");
        this.editname=document.getElementById("editname");
        this.cbox=document.getElementById("cbox")
        this.isopen=false;
        this.layer.style.zIndex="-1";
        this.show(false);
        this.set_name(this.name);
        this.canbesynced=false;
        this.init_headphone();
        this.opened="none";
    },
    add_comments(){
        var plays=document.getElementsByClassName("play");
        plays[2].children[0].children[0].style.opacity=0;
        document.getElementsByClassName("imflex")[0].style.opacity=1;
        document.getElementById("c_d").innerHTML=`<i class="fab fa-comments fa"></i>`;
        this.cmts.innerHTML="";
        for(var i=0;i<res.length;i++)
        {
            if(res[i].message.length==0)continue;
            var date=new Date(res[i].time).toLocaleTimeString();
            this.cmts.innerHTML+=`
            <div class="cele">
                <div class="df">
                    <div class="ele n">${res[i].sender}</div>
                    <div class="time">${date.split(":")[0]+":"+date.split(":")[1]+" "+date.split(" ")[1]}</div>
                </div>
                <div class="ele">${res[i].message}</div>
            </div>
            `;
        }
        this.scrollbot();
    },
    add_schedule(forced=false){
        var plays=document.getElementsByClassName("play");
        //[{"main":"Music Cloud","sub":"1000+ Songs","link":"images/favicon.png","when":""}
        plays[1].children[0].children[0].style.opacity=0;
        document.getElementsByClassName("imflex")[0].style.opacity=0;
        document.getElementById("c_d").innerHTML=`<i class="fab fa-calendar fa"></i>`;
        this.cmts.innerHTML="";
        var today=[];
        for(var i=0;i<sch.length;i++)
        {
            var d=new Date(sch[i].time);
            var _d=new Date();
            if(d.toDateString()==_d.toDateString()){
                //if(_d.getTime()>(d.getTime()+sch[i].dur*60*1000))
                    //continue;
                today.push(sch[i]);
            }
        }
        this.cmts.innerHTML=`
        <div class="cele s">
            <div class="df">
                <div class="ele n">${new Date().toDateString()}</div>
            </div>
            <div class="ele">Upcoming Events</div>
        </div>
            `;
        var count=0;
        for(var i=0;i<today.length;i++){ 
            var _d=new Date(new Date().getTime());
            console.log(_d.toLocaleTimeString());
            count++;
            var d=new Date(today[i].time);
            var d_=new Date(today[i].time+today[i].dur*60*1000);
            if(_d.getTime()>d_.getTime()){
                continue;
            }
            if(_d.getTime()<d_.getTime()){
                if(_d.getTime()>today[i].time){
                    var _event=today[i].main+" - "+today[i].sub;
                    if(links.mediaLink=="https://zeno.fm/events39d6np5v0f8uv/"){
                        document.getElementById("cur_event").innerHTML=_event;
                    }
                }
            }
            this.cmts.innerHTML+=`
            <div class="cele s">
                <div class="df">
                    <div class="ele n">${today[i].main}</div>
                </div>
                <div class="ele">${today[i].sub}</div>
                <div class="ele">${d.toLocaleTimeString().split(" ")[0] +" to "+d_.toLocaleTimeString().split(" ")[0]+" "+d.toLocaleTimeString().split(" ")[1]}</div>
            </div>
            `;
            if(forced && !comments.open=="schedule"){
                plays[1].children[0].children[0].style.opacity=1;
            }
        }
        if(count==0){
            this.cmts.innerHTML=`
            <div class="cele s">
                <div class="df">
                    <div class="ele n">${new Date().toDateString()}</div>
                </div>
                <div class="ele">There are no scheduled events at the moment.Feel free to listen to some great tunes.</div>
            </div>
                `;
        }
    },
    convert(str){ 
        //For when
        var a=str.split(" ")[0]; 
        var b=str.split(" ")[1]; 
        var t=new Date(Number(a.split("-")[0]),Number(a.split("-")[1])-1,Number(a.split("-")[2]),Number(b.split(":")[0]),Number(b.split(":")[1]),0,0); 
        var det=t.getTime(); 
        return det; 
    },
    set_cmt_sh(){
        var temp=[];
        this.cbox.innerHTML="";
        var j=res.length-1;
        for(var i=0;i<3 && j>-1;j--)
        {
            if(res[j].message.length>0)
            {
                temp.push(res[j]);
                i++;
            }
        }
        for(var i=0;i<temp.length;i++)
        {
            var msg=temp[i].message;
            if(temp[i].message.length>12){
                msg=temp[i].message.substr(0,12)+" ...";
            }
            if(temp[i].message.length==0)
                continue;
            var date=new Date(temp[i].time).toLocaleTimeString();
            this.cbox.innerHTML+=`
            <div class="cele__">
                <div class="cname">${temp[i].sender}</div>
                <div class="df">
                    <div class="cmsg">${msg}</div>
                    <div class="time">${date.split(":")[0]+":"+date.split(":")[1]+" "+date.split(" ")[1]}</div>
                </div>
            </div>
            `;
        }
    },
    trim_f(str){
        if(str[0]==" "){
            str=str.substr(1,str.length);
            str=this.trim_f(str);
        }
        return str;
    },
    trim_l(str){
        if(str[str.length-1]==" "){
            str=str.substr(0,str.length-1);
            str=this.trim_l(str);
        }
        return str;
    },
    isvalidname()
    {
        var regex=/^[a-zA-Z0-9]+(?:_[A-Za-z0-9]+)*$/;
        var valid=false;
        var ar=[];
        var nm=this.namediv.value;
        nm=this.trim_f(nm);
        nm=this.trim_l(nm);
        nm=nm.split(" ")[0];
        if(nm.length>5 && nm.match(regex))
        {
            valid=true;
        }
        else
        {
            nm=iniuser.get_ran_name();
        }
        ar.push(valid);
        ar.push(nm);
        return ar;
    },
    set_new_name()
    {
        this.namediv.style.color="black";
        if(this.isvalidname()[0])
        {
            this.set_name(this.isvalidname()[1]);
            iniuser.set(this.isvalidname()[1]);
            this.close();
        }
        else
        {
            this.namediv.style.color="red";
        }
    },
    set_name(val)
    {
        this.name=val;
        this.namediv.placeholder=val;
    },
    process_msg(msg)
    {
        msg=this.trim_f(msg);
        msg=this.trim_l(msg);
        if(msg.length==0)msg=null;
        return msg;
    },
    process()
    {
        var msg=this.process_msg(this.input.value);
        if(msg==null || msg == undefined || msg=="" || msg==" " || msg==[])
            {
                this.clearinput();
                this.scrollbot();
                this.switchstate(false);
                return;
            }
        this.input.value="";
        FireBase.add_new(msg);
    },
    close()
    {
        if(this.settingname){
            this.show(false);
            return;
        }
        if(!this.isopen)return;
        this.cmtbox.style.height="0px";
        this.isopen=false;
        this.layer.style.zIndex="-1";
        this.layer.style.background="transparent";
        this.opened="none";
    },
    open()
    {
        if(this.isopen)return;
        this.cmtbox.style.height="90vh";
        this.isopen=true;
        this.layer.style.zIndex="0";
        this.scrollbot();
        this.layer.style.background="#000000af";
        comments.add_comments();
        this.opened="comment";
    },
    open_cal(){
        if(this.isopen)return;
        this.cmtbox.style.height="90vh";
        this.isopen=true;
        this.layer.style.zIndex="0";
        this.scrollbot();
        this.layer.style.background="#000000af";
        comments.add_schedule();
        this.opened="schedule";

    },
    scrollbot()
    {
        var element = this.cmts;
        element.scrollTop = element.scrollHeight - element.clientHeight;
    },
    clearinput()
    {
        this.input.value="";
        this.scrollbot();
        this.switchstate(false);
    },
    switchstate(val)
    {
        //console.log(this.input.value.length);
        if(this.input.value.length==0)
        {
            this.goingtosend=false;
            val=false;
        }
        this.goingtosend=val;
        this.btn.innerHTML='<i class="fab fa-paper-plane fa"></i>';
        if(!val){
            this.btn.innerHTML='<i class="fab fa-edit fa"></i>';
        }
    },
    do_fn()
    {
        if(!this.goingtosend){
            this.show(true);
        }
        else{
            this.process();
        }
    },
    show(val)
    {
        if(val){
            this.editname.style.zIndex="10";
            this.settingname=true;
            this.editname.style.opacity=1;
            this.namediv.value="";
        }
        else{
            this.editname.style.zIndex="-10";
            this.settingname=false;
            this.editname.style.opacity=0;
        }
    },
    process_name()
    {
        var tname=this.namediv.value;
        this.set_name(tname);
        return true;
    },
    init_headphone()
    {
        var eles=document.getElementsByClassName("g1 l1");
        for(var i=0;i<eles.length;i++)
        {
            var img_d=eles[i].children[0];
            var height=eles[i].parentElement.offsetHeight+40;
            var width=eles[i].offsetWidth;
            //console.log(height);
            img_d.style.height=height+"px";
            img_d.style.width=width+"px";
            //console.log(img_d,height,width);
            this.head_set();
        }
        this.init_sync();
    },
    head_set()
    {
        var marginLeft=(document.getElementsByClassName("mob")[0].offsetWidth-40)+"px";
        var head_i=document.getElementsByClassName("head_i")[0];
        var inil=document.getElementsByClassName("inil")[0];
        inil.style.width=(screen.width/2-head_i.getBoundingClientRect().x-5)+"px";
        head_i.style.marginLeft=marginLeft;
    },
    init_sync()
    {
        var plays=document.getElementsByClassName("play");
        var l=(plays[2].children[0].offsetHeight-6)+"px";
        plays[0].children[0].style.width=l;
        plays[0].children[0].style.height=l;
        this.show_sync();
        for(var i=1;i<plays.length;i++){
            var not=plays[i].children[0].children[0];
            var y=plays[i].children[0].offsetHeight;
            var x=plays[i].children[0].offsetWidth-5;
            not.style.transform=`translate(${x}px,-${y}px)`;
            not.style.opacity=0;
        }
    },
    show_sync(show=false)
    {
        var plays=document.getElementsByClassName("play");
        opacity=0.4;
        plays[0].children[1].style.opacity=0;
        if(show)
        {
            opacity=1;
            plays[0].children[1].style.opacity=1;
        }
        plays[0].style.opacity=opacity;
        this.canbesynced=opacity==1;
    }
}

var events=[
    {
        "heading":"The Not So Funny Show",
        "p":`A show for the ones who crave for a daily dosage of laughter is
        right here. If you have a gloomy day, fret not, as this show is a concoction of carefully
        curated episodes to lighten you up.`
    },
    {
        "heading":"Unfiltered",
        "p":`The world is filled with commotion and uncertainty, and in the midst of
        that, there are different opinions that often go unheard. This is where we come together
        and share views on topics within our own campus and beyond. What is the prerequisite
        for this show you may ask… Well, all you need is an open mind and unfiltered thoughts.`
    },
    {
        "heading":"Chai Un-Cut",
        "p":`A campus that has begun its journey more than six decades ago, along
        with its transition from REC to NITC, it surely has a rich history. Hop right in to
        reminisce memories of our campus through the art of storytelling.`
    },
    {
        "heading":"Center Circle Scoop",
        "p":`Change is constant on our campus, and we often tend to get lost
        in the ever-changing dynamics. Fear not, as Center Circle Scoop is there to update you.`
    },
    {
        "heading":"RECalling",
        "p":`Campus life can often be filled with indecisiveness, constant failures, and
        anxiety. Sometimes all we need are words of assurance from the ones who’ve been
        through it all. We present RECalling, a one on one session with an alumnus every
        fortnight.`
    },
    {
        "heading":"Weekly Checklist",
        "p":`Constant assignments, tests, and quizzes has become a routine for
        us. In the midst of that, we wish for a checklist of the week. Tune in to know the latest
        trends, places, and binge-worthy shows.`
    },
    {
        "heading":"Serenade",
        "p":`Want to dedicate a song for someone special (anonymously, of course) or
        want everyone to discover a song you love. This is your space.`
    },
    {
        "heading":"Voice",
        "p":`NITC is a pool of incredibly talented artists. This is an event where we play
        original/covers sent in by the students. Jump right in to seize the stage.`
    },
    {
        "heading":"Music Cloud",
        "p":`Wanna discover new songs and escape from the songs that you’ve played
        numerous times. Tune in to a Handpicked sound cloud and listen to the latest hits and
        diverse selections.`
    }
]

var content={
    init()
    {
        this.card=document.getElementById("card");
        this.inject_card=document.getElementById("inject_card");
        this.inject_setup();
        this.event_ar=null;
        this.cur_i=0;
        this.setimgs();
    },
    inject_setup()
    {
        this.inject_card.style.height=this.card.offsetHeight+"px";
        this.inject_card.style.width=this.card.offsetWidth+"px";
        this.inject_datas();
    },
    inject_datas()
    {
        this.inject_card.innerHTML="";
        for(var i=0;i<events.length;i++)
        {
            this.inject_card.innerHTML+=
                `<div class="event_df">
                    <div class="con">
                        <h2>${events[i].heading}</h2>
                        <p> ${events[i].p}</p>
                    </div>
                </div>`;
        }
        this.inject_card.innerHTML+=
        `   <div class="c_cards">
                <div class="ele" onclick="content.next()">&lt;</div>
                <div class="ele_g1">dummy</div>
                <div class="ele" onclick="content.next(true)">&gt;</div>
            </div>
        `;
        this.event_ar=document.getElementsByClassName("event_df");
        for(var i=1;i<this.event_ar.length;i++)
        {
            this.event_ar[i].style.transform="translateX(50%) rotateY(90deg)";
        }
        this.cur_i=0;
    },
    next(pre=false)
    {
        var event_ar=document.getElementsByClassName("event_df");
        if( (pre && this.cur_i==0 )|| (!pre && this.cur_i==event_ar.length-1) )
            return false;
        var new_cur_i=this.cur_i+1;
        event_ar[this.cur_i].style.transform="translateX(-50%) rotateY(-90deg)";
        if(pre)
        {
            new_cur_i=this.cur_i-1;
            event_ar[this.cur_i].style.transform="translateX(50%) rotateY(90deg)";
        }
        event_ar[new_cur_i].style.transform="translateX(0%) rotateY(0deg)";
        this.cur_i=new_cur_i;
        return true;
    },
    setimgs()
    {
        var g1_cs=document.getElementsByClassName("g1 c");
        var g1_imgs=document.getElementsByClassName("g1 img");
        for(var i=0;i<g1_cs.length;i++)
        {
            var ht=g1_cs[i].offsetHeight;
            var w=g1_cs[i].offsetWidth*0.4/0.5;
            g1_imgs[i].style.height=ht+"px";
            g1_imgs[i].style.width=w+"px";
            g1_imgs[i].children[0].style.maxHeight=ht+"px";
            g1_imgs[i].children[0].style.maxWidth=w+"px";
            if(ht>w)
                g1_imgs[i].children[0].children[0].style.height=ht+"px";
            else
                g1_imgs[i].children[0].children[0].style.width=w+"px";    
        }
    },
    async changeimg(newsrc,imgele)
    {
        imgele.style.opacity=0.4;
        await FireBase.timer(400);
        imgele.src=newsrc;
        await FireBase.timer(10);
        imgele.style.opacity=1;
        await FireBase.timer(400);
    }
}
var g1_imgs_=document.getElementsByClassName("g1 img");
var imgs_ch=[];
for(var i=0;i<g1_imgs_.length;i++)
{
    imgs_ch.push(g1_imgs_[i].children[0].children[0]);
}
var img_index=0;
var img_links=[
    {
        "vari":0,
        "imgs":3,
        "img0":"images/about/1.png",
        "img1":"images/about/2.png",
        "img2":"images/about/3.png"        
    },
    {
        "vari":0,
        "imgs":5,
        "img0":"images/err/6.png",
        "img1":"images/err/7.png",
        "img2":"images/err/8.png",
        "img3":"images/err/9.png",
        "img4":"images/err/10.png"              
    },
    {
        "vari":0,
        "imgs":5,
        "img0":"images/err/1.png",
        "img1":"images/err/2.png",
        "img2":"images/err/3.png",
        "img3":"images/err/4.png",
        "img4":"images/err/5.png"                
    },
    {
        "vari":0,
        "imgs":3,
        "img0":"images/contact/1.png",
        "img1":"images/contact/2.png",
        "img2":"images/contact/3.png"          
    }
]
function nextlink(_ref)
{
    var next_index=_ref.vari+1;
    if(next_index==_ref.imgs)
        next_index=0;
    _ref.vari=next_index;
    return _ref["img"+next_index];
}
setInterval(()=>{
    if(!onbodyloadcompletly)return;
    content.changeimg(nextlink(img_links[img_index]),imgs_ch[img_index]);
    img_index++;
    if(img_index==g1_imgs_.length)
        img_index=0;
},2000);

var isandroid={
    check(){
        var userAgent=navigator.userAgent||navigator.vendor;
        if(userAgent.match( /Android/i ))
        {
            /*
            window.location.replace("yourapp://path/"); 
            setTimeout(()=>{
            window.location.replace("https://play.google.com/store/apps/details?id=com.nitc.rajpathrecalls"); 
            },2000);
            */
            this.init();
        }
    },
    init()
    {
        var topbar=document.getElementsByClassName("topbar")[0];
        var n_wi=topbar.offsetWidth-topbar.children[0].offsetWidth;
        //var h=topbar.offsetHeight;
        //console.log(n_wi);
        topbar.innerHTML=
        `   
            <div class="b" onclick="menu.switchstate()">
                <span></span>
            </div>
            <div id="and_dwd">
                <h6>Rajpath Recalls app is available on <br> Google Playstore.</h6>
                <a href="https://play.google.com/store/apps/details?id=com.nitc.rajpathrecalls"><button>Download Now</button>
            </div>
        `;
        var ele=document.getElementById("and_dwd");
        ele.style.width=n_wi+"px";
    }
}

//Events switching

var rev=false;
setInterval(()=>{
    if(!onbodyloadcompletly)return;
    var boo=content.next(rev);
    if(!boo)rev=!rev;
},8000);


var mobile={
    init()
    {
        this.mobi=document.getElementsByClassName("mobi")[0];
        this.absmobi=document.getElementById("mobi");
        this.set();
    },
    set()
    {
        this.absmobi.style.height=(this.mobi.offsetHeight-20)+"px";
        this.absmobi.style.width=(this.mobi.offsetWidth-20)+"px";
    }
}

var noti={
    init()
    {
        this.msgbox=document.getElementById("noti");
    },
    changecol(col)
    {
        this.msgbox.style.color=col;
    },
    async msg(notify,color,time=0)
    {
        this.msgbox.innerHTML=notify;
        this.changecol(color);
        this.appear();
        if(time>0)
        {
            await FireBase.timer(time);
            this.appear(false);
        }
    },
    appear(boo=true)
    {
        this.msgbox.style.opacity=1;
        if(!boo)
            this.msgbox.style.opacity=0;
    }
}

var menu={
    init()
    {
        this.mdiv=document.getElementById("mdiv");
        this.b=document.getElementsByClassName("b")[0];
        this.menuactive=false;
    },
    switchstate()
    {
        var ht="auto";
        if(this.menuactive)
        {
            this.b.classList.remove("c");
            ht="0px";
        }
        else
        {
            this.b.classList.add("c");
        }
        this.menuactive=!this.menuactive;
        this.mdiv.style.height=ht;
    },
    async call()
    {
        await FireBase.timer(10);
        //this.switchstate();
        //return;
        window.scrollBy(0,50);
        this.switchstate();
        for(var i=0;i<100;i++)
        {
            window.scrollBy(0,-1);
            await FireBase.timer(200/100);
        }
    }
}

var iniuser={
    init()
    {
        this.key='https://rajpathrecalls.web.app-user';
        this.name=localStorage[this.key] || this.get_ran_name();
        this.set(this.name);
    },
    set(name)
    {
        this.name=name;
        localStorage[this.key] = name;
    },
    get()
    {
        return this.name;
    },
    get_ran_name()
    {
        var f_n=["Anon","Floyd","Ninja","Ram","Queen","Prince","King","Star"];
        var i=Math.floor(Math.random()*f_n.length);
        var i1=Math.floor(10*Math.random());
        var i2=Math.floor(10*Math.random());
        var l_n=i1*10+i2;
        return f_n[i]+"_"+l_n+""+l_n;
    }
}


//player - copy pasted from pre module

var player=null;
var oldplayer=null;
var lagging=0;
var playerpausedat;
var btn=document.getElementById("ch_main_p");
var links;

//Firebase call to links

firebase.database().ref('Links/').on('value',(sanapshot)=>{
    links=sanapshot.val();
    if(boolplay)
            sync(true);
});

function initplayer()
{
    var srclink=links.mediaLink;
    var newplayer=new Audio;
    newplayer.src=srclink;
    return newplayer;
}
function sync(force=false)
{
    if(!comments.canbesynced && !force)
        return;
    lagging=0;
    oldplayer=player;
    player=null;
    play();
    comments.show_sync();
}
var loadinganewplayeralready=false;
function play()
{
    comments.show_sync();
    var newplayer=null;
    if(player==null && !loadinganewplayeralready)
    {
        newplayer=initplayer();
        boolplay=false;
        loadinganewplayeralready=true;
    }
    if(boolplay){
        player.pause();
        playerpausedat=new Date;
        boolplay=false;
        btn.innerHTML=`<i class="fab fa-play fa"></i>`;
        /*
        wave.style.animation="none";
        playbar=false;
        load.classList.remove("load");
        bird1.style.opacity=0;
        bird2.style.opacity=0;
        Messagebox("Pausing Leads to Lagging","","red","orange",0);
        */
       noti.msg("Pausing leads to lagging","white");
       //console.log("Pausing leads to lagging");
       comments.show_sync(true);
    }
    else{/*
        bird1.style.opacity=1;
        bird2.style.opacity=1;
        Messagebox("Establishing Connection...","","#0f0","green",0);*/
        if(lagging==0)
        {
            //console.log("Establishing Connection...");
            noti.msg("Establishing Connection...","white");
        }
        else
        {
            noti.msg("Network Error leads to lagging...","white");
        }
        if(newplayer!=null)
        {
            if(newplayer.play()!==undefined)
            {
                newplayer.play().then(()=>{
                    if(oldplayer!=null)
                    {
                        //need to change this piece of code
                        oldplayer.pause();
                        oldplayer.src="";
                    }
                    player=newplayer;
                    boolplay=true;
                    btn.innerHTML=`<i class="fab fa-pause fa"></i>`;
                    /*
                    Messagebox("Connected Sucessfully","","#0f0","green",2);
                    wave.style.animation="wave 1s linear infinite";
                    playbar=true;
                    load.classList.remove("load");
                    bird1.style.opacity=0;
                    bird2.style.opacity=0; 
                    */
                    //console.log("Connected Sucessfully...");
                    noti.msg("Connected Sucessfully...","white",2000);
                    loadinganewplayeralready=false;
                    return;
                })
                .catch(error=>{
                    if(oldplayer!=null)
                    {
                        //need to change this piece of code
                        oldplayer.pause();
                    }/*
                    Messagebox("Network issue dectected","Retry","red","orange",0);
                    wave.style.animation="none";
                    playbar=false;
                    load.classList.remove("load");
                    bird1.style.opacity=0;
                    bird2.style.opacity=0;
                    */
                    btn.innerHTML=`<i class="fab fa-play fa"></i>`;
                    //console.log("Network Isuues...");
                    noti.msg("Network Issues...","white");
                    loadinganewplayeralready=false;
                    comments.show_sync(true);
                    return;
                });
            }
            return;
        }
        if(player.play()!==undefined){
            player.play().then(()=>{
                var temp=new Date;
                lagging+=(temp-playerpausedat)/1000;
                boolplay=true;
                btn.innerHTML=`<i class="fab fa-pause fa"></i>`;
                /*
                var lag="Lagging by "+Math.floor(lagging)+"s with livestream";
                if(lag==0){lag=1};
                Messagebox(lag,"Sync","red","orange",0);
                wave.style.animation="wave 1s linear infinite";
                playbar=true;
                load.classList.remove("load");
                bird1.style.opacity=0;
                bird2.style.opacity=0;
                */
               //console.log("Lagging by "+Math.floor(lagging*100)/100+"s with livestream");
               if(lagging>0.4)
               {
                    noti.msg("Lagging by "+Math.floor(lagging*100)/100+"s with livestream","#fff");
                    comments.show_sync(true);
               }
            })
            .catch(error=>{
                btn.innerHTML=`<i class="fab fa-play fa"></i>`;
                /*
                Messagebox("Network issue dectected","Retry","red","orange",0);
                wave.style.animation="none";
                playbar=false;
                load.classList.remove("load");
                bird1.style.opacity=0;
                bird2.style.opacity=0;
                */
               //console.log("Network Isuue detecetd");
                return;
            });
        }
    }
}
//is user is playing then boolplay is true
var pretime;
var buffering=0;
var called=false;
var boolplay=false;

setInterval(()=>{
    if(!boolplay || player==null){
        return;
    }
    if(player.currentTime==pretime){
        buffering++;
        if(buffering>2 && !called){
            play();
            play();
            //Messagebox("Network issue dectected - Leads to lagging","Sync Now","red","orange",0);
            called=true;
        }
    }
    else{
        buffering=0;
        called=false;
    }
    pretime=player.currentTime;
},100)


//media session ---------------------------------------------------------------------------------------


if ('mediaSession' in navigator) {

    navigator.mediaSession.metadata = new MediaMetadata({
    title: 'Rajpath Recalls',
    artist: 'Music Cloud',
    album: '1000+ songs',
    artwork: [
            //{ src: 'https://dummyimage.com/96x96',   sizes: '96x96',   type: 'image/png' },
            //{ src: 'https://dummyimage.com/128x128', sizes: '128x128', type: 'image/png' },
            //{ src: 'https://dummyimage.com/192x192', sizes: '192x192', type: 'image/png' },
            //{ src: 'https://dummyimage.com/256x256', sizes: '256x256', type: 'image/png' },
            //{ src: 'https://dummyimage.com/384x384', sizes: '384x384', type: 'image/png' },
            { src: 'favicon_orange.png', sizes: '500x500', type: 'image/png' },
    ]
    });

    navigator.mediaSession.setActionHandler('play', function() {
        play();
    });
    navigator.mediaSession.setActionHandler('pause', function() {
        play();
    });
}
