package com.prj.pojo;

import java.io.Serializable;
import java.util.Date;

public class notices implements Serializable{
	private int nid;                // 公告序号
	private String ntitle; 			// 信息标题
	private Date nstartDate;		// 启用日期
	private Date noldDate;			// 过期日期
	private Date ncreateDate;		// 创建时间
	private String nname;			// 创建人
	private Date ntime;				// 最后更新时间
	private String noldName;		// 最后更新人
	private int nstatns;			// 公告状态 0表示未启用 1表示使用中
	public notices() {
		super();
		// TODO Auto-generated constructor stub
	}
	public notices(int nid, String ntitle, Date nstartDate, Date noldDate,
			Date ncreateDate, String nname, Date ntime, String noldName,
			int nstatns) {
		super();
		this.nid = nid;
		this.ntitle = ntitle;
		this.nstartDate = nstartDate;
		this.noldDate = noldDate;
		this.ncreateDate = ncreateDate;
		this.nname = nname;
		this.ntime = ntime;
		this.noldName = noldName;
		this.nstatns = nstatns;
	}
	public int getNid() {
		return nid;
	}
	public void setNid(int nid) {
		this.nid = nid;
	}
	public String getNtitle() {
		return ntitle;
	}
	public void setNtitle(String ntitle) {
		this.ntitle = ntitle;
	}
	public Date getNstartDate() {
		return nstartDate;
	}
	public void setNstartDate(Date nstartDate) {
		this.nstartDate = nstartDate;
	}
	public Date getNoldDate() {
		return noldDate;
	}
	public void setNoldDate(Date noldDate) {
		this.noldDate = noldDate;
	}
	public Date getNcreateDate() {
		return ncreateDate;
	}
	public void setNcreateDate(Date ncreateDate) {
		this.ncreateDate = ncreateDate;
	}
	public String getNname() {
		return nname;
	}
	public void setNname(String nname) {
		this.nname = nname;
	}
	public Date getNtime() {
		return ntime;
	}
	public void setNtime(Date ntime) {
		this.ntime = ntime;
	}
	public String getNoldName() {
		return noldName;
	}
	public void setNoldName(String noldName) {
		this.noldName = noldName;
	}
	public int getNstatns() {
		return nstatns;
	}
	public void setNstatns(int nstatns) {
		this.nstatns = nstatns;
	}
	
	
}
