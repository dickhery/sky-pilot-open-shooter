module {
  /// Packed ISO 3166-1 alpha-2 codes plus a few common flag territories.
  /// Lookups use `",cc,"` so two-letter codes cannot false-match a neighbor.
  let packed : Text = ",ad,ae,af,ag,ai,al,am,ao,ar,at,au,aw,az,ba,bb,bd,be,bf,bg,bh,bi,bj,bn,bo,br,bs,bt,bw,by,bz,ca,cd,cf,cg,ch,ci,cl,cm,cn,co,cr,cu,cv,cy,cz,de,dj,dk,dm,do,dz,ec,ee,eg,er,es,et,fi,fj,fm,fr,ga,gb,gd,ge,gh,gm,gn,gq,gr,gt,gw,gy,hk,hn,hr,ht,hu,id,ie,il,in,iq,ir,is,it,jm,jo,jp,ke,kg,kh,ki,km,kn,kp,kr,kw,kz,la,lb,lc,li,lk,lr,ls,lt,lu,lv,ly,ma,mc,md,me,mg,mh,mk,ml,mm,mn,mr,mt,mu,mv,mw,mx,my,mz,na,ne,ng,ni,nl,no,np,nr,nz,om,pa,pe,pg,ph,pk,pl,pt,pw,py,qa,ro,rs,ru,rw,sa,sb,sc,sd,se,sg,si,sk,sl,sm,sn,so,sr,ss,st,sv,sy,sz,td,tg,th,tj,tl,tm,tn,to,tr,tt,tv,tw,tz,ua,ug,us,uy,uz,va,vc,ve,vn,vu,ws,xk,ye,za,zm,zw,";

  public func normalize(raw : Text) : Text {
    raw.trim(#text " ").toLower();
  };

  public func isAllowed(code : Text) : Bool {
    if (code.size() != 2) {
      return false;
    };
    packed.contains(#text("," # code # ","));
  };
};
